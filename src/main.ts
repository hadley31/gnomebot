import { GatewayIntentBits, Collection, MessageFlags, VoiceState, ChatInputCommandInteraction, Message } from "discord.js"
import { getUserNameIDString } from "./utilities/discord.js"
import logger from "./utilities/logger.js"
import env from "dotenv"
import deployCommands from "./utilities/deployCommands.js"
import { GnomebotClient } from "./client.js"
import { voiceTriggers } from "./triggers/voice/index.js"
import { textTriggers } from "./triggers/text/index.js"
import { commands } from "./commands/index.js"

env.config()

const { DISCORD_AUTH_TOKEN } = process.env

const client = new GnomebotClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
})
client.commands = new Collection()

// Dynamically load commands
logger.info('Loading commands...')
for (const command of commands) {
  client.commands.set(command.name, command)
}

deployCommands(client.commands.map(command => command.getSlashCommand()))


client.on("clientReady", (event) => {
  logger.info(`Client connected. Logged in as: ${getUserNameIDString(client.user!)}`)
  client.user!.setActivity("Hello me ol' chum!")
})

client.on("messageCreate", (message: Message) => {
  if (message.author.id == client.user!.id) return

  textTriggers.forEach(async (trigger) => {
    try {
      if (await trigger.test(message)) {
        logger.info(`${getUserNameIDString(message.author)} triggered a text event: ${trigger.name}`, { 'content': message.content })
        trigger.execute(message)
      }
    } catch (err) {
      logger.error(`An error occurred while executing ${trigger.name} text trigger:\n${err}`)
    }
  })
})

client.on("interactionCreate", (interaction) => {
  if (!interaction.isCommand()) return
  if (!client.commands.has(interaction.commandName)) return

  try {
    if (interaction instanceof ChatInputCommandInteraction) {
      logger.info(`${getUserNameIDString(interaction.user)} used command: ${interaction}`)
      return client.commands.get(interaction.commandName)?.execute(interaction)
    }
  } catch (err) {
    logger.error(`An error occurred while running command: ${interaction}:\n${err}`)
    return interaction.reply({ content: "An error occurred while executing that command!", options: { flags: MessageFlags.Ephemeral } })
  }
})


// Called when anything about a user's voice state changes (i.e. mute, unmute, join,leave,change channel, etc.)
client.on("voiceStateUpdate", (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
  if (oldVoiceState.member!.user.id === oldVoiceState.client.user.id) return
  logger.debug(`${oldVoiceState.member!.user.username}'s voice state changed:\n${oldVoiceState.channel?.name} -> ${newVoiceState?.channel?.name}`)
  voiceTriggers.forEach(async (trigger) => {
    try {
      if (await trigger.test(oldVoiceState, newVoiceState)) {
        logger.info(`${getUserNameIDString(oldVoiceState.member!.user)} triggered a voice event: ${trigger.name}`, { 'old_channel': oldVoiceState.channel, 'new_channel': newVoiceState.channel })
        trigger.execute(oldVoiceState, newVoiceState)
      }
    } catch (err) {
      logger.error(`An error occurred while executing ${trigger.name} voice trigger:\n${err}`)
    }
  })
})

client.on("disconnect", (err) => {
  logger.info("Gnomebot disconnected from discord")
})

client.on("error", (err) => {
  logger.error(`An unexpected error occured:\n${err}`)
})

client.login(DISCORD_AUTH_TOKEN)

export default client
