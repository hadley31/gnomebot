import { GNOME_SOUND } from "../../constants.js"
import DiscordUtil from "../../utilities/discord.js"
import logger from "../../utilities/logger.js"
import type { VoiceTrigger } from "../types.js"
import { VoiceBasedChannel, VoiceState } from "discord.js"

const { getUserNameIDString, getChannelNameIDString } = DiscordUtil

const RandomWooVoiceTrigger: VoiceTrigger ={
  name: "Random Gnome",
  desc: "Randomly joins a chat channel and makes a noise.",
  /**
   * @param {import('discord.js').VoiceState} oldVoiceState
   * @param {import('discord.js').VoiceState} newVoiceState
   */
  async test(oldVoiceState: VoiceState, newVoiceState: VoiceState): Promise<boolean> {
    return !!(
      newVoiceState.channel &&
      Math.random() < 0.04 &&
      (oldVoiceState.channelId !== newVoiceState.channelId ||
        (oldVoiceState.deaf && !newVoiceState.deaf))
    )
  },

  async execute(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    let member = newVoiceState.member!

    logger.info(
      `${getUserNameIDString(
        member.user
      )} joined channel: ${getChannelNameIDString(newVoiceState.channel!)})`
    )

    DiscordUtil.playSound(newVoiceState.channel as VoiceBasedChannel, GNOME_SOUND)
  },
}

export default RandomWooVoiceTrigger
