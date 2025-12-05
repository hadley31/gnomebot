import { Channel, GuildMember, GuildTextBasedChannel, Message, PermissionsBitField, User, VoiceBasedChannel } from "discord.js"
import logger from "./logger.js"
import { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } from "@discordjs/voice"

/**
 *
 * @param {import('discord.js').User} user
 */
export function getUserNameIDString(user: User | GuildMember) {
  return `${user.displayName} (${user.id})`
}

/**
 *
 * @param {import('discord.js').Channel} channel
 */
export function getChannelNameIDString(channel: GuildTextBasedChannel | VoiceBasedChannel) {
  return `${channel.name} (${channel.id})`
}

/**
 *
 * @param {import('discord.js').Message} message
 */
export function logMessage(message: Message) {
  let userString = getUserNameIDString(message.author)
  let server = message.guild
    ? `${message.guild.name} (${message.guild.id})`
    : "none"
  let channel =
    server === "none"
      ? message.channel.id
      : getChannelNameIDString(message.channel as GuildTextBasedChannel)
  logger.info(
    `Message (${message.id}):\n\tUser: ${userString}\n\tServer: ${server}\n\tChannel: ${channel}\n\tContent: ${message.content}`
  )
}

/**
 *
 * @param {import('discord.js').VoiceChannel} channel
 * @param {String} audioAsset
 * @param {Object} options
 * @param {Number} options.volume
 */
export async function playSound(channel: VoiceBasedChannel, audioAsset: any, {volume = 0.5} = {}) {
  if (channel === undefined) {
    logger.warning('PlaySound: Channel undefined!')
    return
  }

  const channelString = getChannelNameIDString(channel)

  if (audioAsset === undefined) {
    logger.error("No audio asset specified. Pass either a file path or stream")
    return
  }

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    })

    logger.info(`Joined voice channel: ${channelString}`)

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      }
    })
    const resource = createAudioResource(audioAsset, {inlineVolume: true})
    resource.volume?.setVolume(volume)

    connection.subscribe(player)
    player.play(resource)

    player.on(AudioPlayerStatus.Idle, (_, __) => connection.destroy())
  } catch (err) {
    logger.error(`An error occured while joining ${channelString}`)
    logger.error(err)
  }
}

export async function getUserVoiceChannel(member: GuildMember): Promise<VoiceBasedChannel | null> {
  return member.voice.channel ?? null
}

export function isAdministrator(member: GuildMember): boolean {
  return member.permissions.has(PermissionsBitField.Flags.Administrator)
}


export function getFirstVoiceChannelOfMembers(members: GuildMember[]): VoiceBasedChannel | null {
  if (!members) {
    return null
  }

  return members.map(x => x.voice).find(x => x.channel)?.channel ?? null
}

export default {
  playSound,
  logMessage,
  getChannelNameIDString,
  getUserNameIDString,
  getFirstVoiceChannelOfMembers,
}