import logger from "../utilities/logger.js"
import { getUserNameIDString, isAdministrator, playSound, } from "../utilities/discord.js"
import { GNOME_SOUND, GNOME_POWER } from "../constants.js"
import { SlashCommandBuilder } from '@discordjs/builders'
import { ChannelType, ChatInputCommandInteraction, GuildMember, MessageFlags, PermissionsBitField, TextBasedChannel, VoiceBasedChannel } from "discord.js"
import { getVoiceConnection } from "@discordjs/voice"
import { Command } from "./types.js"


const GnomeCommand: Command = {
  name: "gnome",
  desc: "Gnomebot will join your channel and makes a noise.",

  async execute(interaction: ChatInputCommandInteraction) {
    const userOption = interaction.options.getMember('user') as GuildMember
    const channelOption = interaction.options.getChannel('channel') as VoiceBasedChannel
    const hasPermission = isAdministrator(interaction.member as GuildMember)

    if (!hasPermission && (userOption || channelOption)) {
      logger.info(`${getUserNameIDString(interaction.member as GuildMember)} is not an administrator.`)
      return interaction.reply({ content: "You must be an administrator to use that command", options: { flags: MessageFlags.Ephemeral } })
    }

    const channel = await getChannel(interaction, channelOption, userOption)

    if (!channel) {
      logger.info(`${getUserNameIDString(interaction.member as GuildMember)} is not in a voice channel.`)
      return interaction.reply({ content: "You are not in a voice channel!", options: { flags: MessageFlags.Ephemeral } })
    }

    //  /gnome power
    if (interaction.options.getSubcommand() === 'power') {
      return handleGnomePower(interaction, channel)
    }

    //  /gnome stop
    if (interaction.options.getSubcommand() === 'stop') {
      return handleStopSubcommand(interaction)
    }

    //  /gnome
    return handleDefaultOption(interaction, channel)
  },

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('gnome')
      .setDescription('Plays the gnome sound in your voice chat!')
      .addSubcommand(subcommand =>
        subcommand
          .setName('power')
          .setDescription('Join your voice channel')
          .addChannelOption(channel =>
            channel
              .setName('channel')
              .setDescription('Join this voice channel')
              .addChannelTypes(ChannelType.GuildVoice)
          )
          .addUserOption(user =>
            user
              .setName('user')
              .setDescription('Join this user\'s voice channel')
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('sound')
          .setDescription('Join your voice channel')
          .addChannelOption(channel =>
            channel
              .setName('channel')
              .setDescription('Join this voice channel')
              .addChannelTypes(ChannelType.GuildVoice)
          )
          .addUserOption(user =>
            user
              .setName('user')
              .setDescription('Join this user\'s voice channel')
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('stop')
          .setDescription('Gnomebot leaves the voice channel')
      )
  }
}

/**
 * Handles specific command case: `/gnome @member`
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {import('discord.js').VoiceChannel} channelOption
 * @param {import('discord.js').GuildMember} userOption
 */
async function getChannel (interaction: ChatInputCommandInteraction, channelOption: VoiceBasedChannel, userOption: GuildMember): Promise<VoiceBasedChannel | null> {
  if (channelOption) {
    return channelOption
  }

  if (userOption) {
    return userOption.voice?.channel
  }

  const guildMember = await interaction.guild?.members.fetch(interaction.user.id)

  return guildMember?.voice?.channel ?? null
}

/**
 * Handles specific command case: `/gnome #channel`
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {import('discord.js').VoiceChannel} channel
 */
const handleGnomePower = async (interaction: ChatInputCommandInteraction, channel: VoiceBasedChannel) => {
  await interaction.reply({ content: `Joining voice channel: ${channel}`, options: { flags: MessageFlags.Ephemeral } })

  return playSound(channel, GNOME_POWER)
}

/**
 * Handles default command case: `/gnome`
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {import('discord.js').VoiceChannel} channel
 */
const handleDefaultOption = async (interaction: ChatInputCommandInteraction, channel: VoiceBasedChannel) => {
  if (!channel) {
    logger.info(`${getUserNameIDString(interaction.member as GuildMember)} is not in a voice channel.`)
    return interaction.reply({ content: "You are not in a voice channel!", options: { flags: MessageFlags.Ephemeral } })
  }

  await interaction.reply({ content: `Joining voice channel: ${channel}`, options: { flags: MessageFlags.Ephemeral } })

  return playSound(channel, GNOME_SOUND)
}

/**
 * Handles specific command case: `/gnome stop`
 * @param {import('discord.js').CommandInteraction} interaction 
 * @returns 
 */
const handleStopSubcommand = async (interaction: ChatInputCommandInteraction) => {
  const connection = getVoiceConnection(interaction.guildId!)
  connection?.destroy()

  return interaction.reply({ content: 'Gnome ya later!', options: { flags: MessageFlags.Ephemeral } })
}

export default GnomeCommand
