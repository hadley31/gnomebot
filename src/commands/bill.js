import logger from "../util/logger.js"
import { playSound } from "../util/discord.js"
import ytdl from "ytdl-core"
import { closestMatch } from 'closest-match'
import fetch from 'node-fetch'
import _ from 'lodash'


export default {
  name: "bill",
  desc: "Gnomebot will join your channel and play a bill wurtz song",
  /**
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(interaction) {
    const song = interaction.options.getString('title')

    const songs = await getSongs()

    const closestMatchingSong = closestMatch(song, Object.keys(songs))

    const userVoiceChannel = interaction.member.voice?.channel

    if (!userVoiceChannel) {
      return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true })
    }

    const videoId = songs[closestMatchingSong]
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    const stream = ytdl(videoUrl, { filter: 'audioonly' })

    playSound(userVoiceChannel, stream, { volume: 0.3 })

    return interaction.reply(`Playing \`${closestMatchingSong}\` by Bill Wurtz in ${userVoiceChannel}`)
  }
}


const getSongs = async () => {
  logger.debug('Loading bill wurtz songs...')
  const { YOUTUBE_API_KEY } = process.env
  const playlistId = 'PLo7FOXNe7Yt8xXI3qYIualWNtIKlkeMlE'
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=25&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
  const result = await fetch(url)

  if (!result.ok) {
    logger.info(url)
    logger.info(await result.text())
    logger.error('Unable to get songs list')
    return
  }

  const data = await result.json()

  const songs = {}

  for (const item of data.items) {
    songs[item.snippet.title] = item.contentDetails.videoId
  }

  for (const [key, value] of Object.entries(songs)) {
    console.log(`${key}: ${value}`)
  }

  return songs
}
