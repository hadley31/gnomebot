import _ from "lodash"
import logger from "../../utilities/logger.js"
import { getGameImageEmbed } from "../../utilities/chess.js"
import chess from "../../services/chess.js"
import type { TextTrigger } from "../types.js"
import type { Message } from "discord.js"

const ChessTextTrigger: TextTrigger = {
  name: "Chess",
  desc: `Makes a chess move if it is valid algebraic notation`,
  /**
   * @param {import('discord.js').Message} message
   */
  async test(message: Message): Promise<boolean> {
    const game = await chess.getGame(message.channel)
    return !!game && game.moves().includes(message.content)
  },

  async execute(message: Message) {
    const result = await chess.handleMove(message.channel, message.author, message.content)

    if ('error' in result) {
      logger.error('Something went wrong')
      return
    }

    const { game, side, reply, move } = result

    if (!game) {
      logger.error('No game found after move was made')
      return
    }

    const embedOptions = { move: move, reply: reply, side: side }
    const imageEmbed = await getGameImageEmbed(game.fen(), embedOptions)

    return message.reply(imageEmbed)
  },
}

export default ChessTextTrigger
