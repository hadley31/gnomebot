import type { TextTrigger } from "../types"

const gnome_regex = /.*g.*n.*[o0].*m.*[e3].*/gi

const GnomeEmojiTextTrigger: TextTrigger = {
    name: "gnome emoji",
    desc: `Adds a gnome emoji if a message contains g n o m e.`,

    async test(message) {
        return Math.random() < 0.05 && gnome_regex.test(message.content)
    },

    async execute(message) {
        message.react('gnome:623704257161461792')
    }
}

export default GnomeEmojiTextTrigger
