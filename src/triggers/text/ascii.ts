import { ASCII_GNOMES } from "../../constants.js"
import _ from "lodash"
import type { TextTrigger } from "../types.js"
import type { Message } from "discord.js"

const gnome_regex = /.*g.*n.*[o0].*m.*[e3].*/gi

const AsciiTextTrigger: TextTrigger = {
  name: "ASCII Gnome",
  desc: `Prints a gnome if a message contains g n o m e.`,

  async test(message: Message): Promise<boolean> {
    return Math.random() < 0.01 && gnome_regex.test(message.content)
  },

  async execute(message: Message): Promise<void> {
    const gnome = _.sample(ASCII_GNOMES)!
    if (message.channel.isSendable()) {
      message.channel.send(gnome)
    }
  },
}

export default AsciiTextTrigger