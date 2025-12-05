import logger from "../utilities/logger.js"
import { ASCII_GNOMES } from "../constants.js"
import _ from "lodash"
import { SlashCommandBuilder } from '@discordjs/builders'
import type { ChatInputCommandInteraction } from "discord.js"
import { Command } from "./types.js"

const AsciiCommand: Command = {
  name: "ascii",
  desc: "Prints a random ascii gnome to the chat.",

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const gnome = _.sample(ASCII_GNOMES)!
      interaction.reply(gnome)
    } catch (err) {
      logger.info("An error occured in ascii command")
    }
  },

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('ascii')
      .setDescription('Prints a random ascii gnome to the chat.')
  }
}

export default AsciiCommand