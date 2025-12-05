import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import dotenv from 'dotenv'
import { CommandBuilder } from '../commands/types'
import logger from './logger'

dotenv.config()

const { CLIENT_ID, GUILD_ID, DISCORD_AUTH_TOKEN } = process.env

/**
 * 
 * @param {SlashCommandBuilder[]} commands 
 */
export default function deployCommands(commandBuilders: CommandBuilder[]) {
  if (!CLIENT_ID || !DISCORD_AUTH_TOKEN || !GUILD_ID) {
    throw new Error('Missing CLIENT_ID, DISCORD_AUTH_TOKEN, or GUILD_ID in environment variables.')
  }

  const commands = commandBuilders.map(command => command.toJSON())

  logger.info('Deploying the following commands:')
  logger.info(JSON.stringify(commands, null, 2))

  const rest = new REST({ version: '10' }).setToken(DISCORD_AUTH_TOKEN)

  if (process.env.NODE_ENV === 'production') {
    rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
      .then(() => logger.info('Successfully registered application commands in all registered guilds.'))
      .catch(logger.error)
  } else if (process.env.NODE_ENV === 'development') {
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
      .then(() => logger.info(`Successfully registered commands in guild: ${GUILD_ID}`))
      .catch(logger.error)
  }
}
