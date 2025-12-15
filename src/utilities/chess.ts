import ChessImageGenerator, { Options } from "chess-image-generator"
import { Color, Square } from "chess.js"
import { AttachmentBuilder, EmbedBuilder } from 'discord.js'

type ChessMove = {
  from: Square,
  to: Square
}

const imageOptions: Options = {
  size: 512,
  style: 'cburnett'
}

const imageGenerator = new ChessImageGenerator(imageOptions)

/**
 * Generates an image buffer of a particular board state
 * @param {String} fen
 */
export async function generateImage(fen: string, { move = {}, flipped = false } = {}) {
  imageGenerator.setHighlightedSquares(move)
  imageGenerator.flipped = flipped
  imageGenerator.loadFEN(fen)
  return imageGenerator.generateBuffer()
}

type GameImageEmbedOptions = {
  move?: ChessMove,
  reply?: string,
  side?: Color
}

/**
 * Sends a reply message containing an image of the current board state
 * @param {CommandInteraction} interaction
 * @param {String} fen
 * @param {Object} options
 * @param {Move} options.move
 * @param {String} options.reply
 * @param {String} options.side
 */
export async function getGameImageEmbed (fen: string, { move, reply = '', side = 'w' }: GameImageEmbedOptions) {
  const imageBuffer = await generateImage(fen, {
    move: move && { [move.from]: true, [move.to]: true, },
    flipped: side === 'b'
  })

  const imageAttachment = new AttachmentBuilder(imageBuffer, { name: 'chess.png' })
  const imageEmbed = new EmbedBuilder()
    .setTitle('Chess Game')
    .setDescription(reply)
    .setImage('attachment://chess.png')
  return {
    embeds: [imageEmbed],
    files: [
      imageAttachment
    ]
  }
}
