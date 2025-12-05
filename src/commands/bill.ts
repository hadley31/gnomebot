import logger from "../utilities/logger.js"
import { playSound } from "../utilities/discord.js"
import ytdl from "ytdl-core"
import { closestMatch } from 'closest-match'
import _ from 'lodash'
import { SlashCommandBuilder } from '@discordjs/builders'
import type { ChatInputCommandInteraction, VoiceChannel } from "discord.js"
import { MessageFlags } from "discord.js"
import { Command } from "./types.js"


const BillCommand: Command = {
  name: "bill",
  desc: "Gnomebot will join your voice channel and play a bill wurtz song",
  /**
   * Command handler for `/bill`
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const song = interaction.options.getString('title')
    const volume = interaction.options.getInteger('volume', false) || 30
    const volumePercent = volume / 100.0

    const guildMember = await interaction.guild?.members?.fetch(interaction.user.id)
    const userVoiceChannel = guildMember?.voice?.channel

    if (!song) {
      return interaction.reply({ content: 'You must provide a song title!', options: { flags: MessageFlags.Ephemeral } })
    }

    if (!userVoiceChannel) {
      return interaction.reply({ content: 'You must be in a voice channel!', options: { flags: MessageFlags.Ephemeral } })
    }

    const songs = await getSongs()

    const closestMatchingSong = closestMatch(song, Object.keys(songs)) as string

    if (!closestMatchingSong) {
      return interaction.reply({ content: `Could not find a song matching "${song}"`, options: { flags: MessageFlags.Ephemeral } })
    }

    const videoId = songs[closestMatchingSong]
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    const stream = ytdl(videoUrl, { filter: 'audioonly' })

    playSound(userVoiceChannel, stream, { volume: volumePercent })

    return interaction.reply(`**Now playing**: \`${closestMatchingSong}\` by Bill Wurtz in ${userVoiceChannel}`)
  },

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('bill')
      .setDescription('Plays a Bill Wurtz song in your voice channel')
      .addStringOption(option =>
        option
          .setName('title')
          .setDescription('The title of the song to play')
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option
          .setName('volume')
          .setDescription('Volume to use: 0-100')
          .setRequired(false)
      )
  }
}

type YouTubeVideoDetails = {
  snippet: {
    title: string
  }
  contentDetails: {
    videoId: string
  }
}

type YouTubeVideoCollection = {
  items: YouTubeVideoDetails[]
}


const getSongs: () => Promise<Record<string, string>> = async () => {
  logger.debug('Loading bill wurtz songs...')
  const { YOUTUBE_API_KEY } = process.env
  const playlistId = 'PLo7FOXNe7Yt8xXI3qYIualWNtIKlkeMlE'
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
  const result = await fetch(url) as any

  if (!result.ok) {
    logger.error('Unable to get songs list')
    return {}
  }

  const data = await result.json() as YouTubeVideoCollection

  const songs: Record<string, string> = {}

  for (const item of data.items) {
    songs[item.snippet.title] = item.contentDetails.videoId
  }

  return songs
}

export default BillCommand