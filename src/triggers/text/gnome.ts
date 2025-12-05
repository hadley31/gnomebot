import type { Message } from "discord.js"
import { GNOME_SOUND } from "../../constants.js"
import DiscordUtil from "../../utilities/discord.js"
import type { TextTrigger } from "../types.js"

const GnomeTextTrigger: TextTrigger = {
  name: "Random Gnome",
  desc: `A throwback to the original trigger for gnome`,

  
  async test(message: Message): Promise<boolean> {
    return message.content === "hello me ol' chum" && !!message.member?.voice?.channel
  },

  async execute(message: Message) {
    const voiceChannel = message.member?.voice.channel

    if (!voiceChannel) {
      return
    }

    DiscordUtil.playSound(voiceChannel, GNOME_SOUND)
  },
}

export default GnomeTextTrigger
