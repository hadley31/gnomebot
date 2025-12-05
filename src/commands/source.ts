import { SlashCommandBuilder } from '@discordjs/builders'
import type { ChatInputCommandInteraction } from 'discord.js'
import type { Command } from './types'

const SourceCommand: Command = {
  name: "source",
  desc: "Replies with my github repository.",
  /**
   *
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(interaction: ChatInputCommandInteraction) {
    interaction.reply("[](https://www.github.com/hadley31/gnomebot)")
  },

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('source')
      .setDescription('Replies with my github repository.')
  }
}

export default SourceCommand