import { Chess, Color, Move } from 'chess.js'
import { closestMatch } from 'closest-match'
import _ from "lodash"
import { ERROR_RESPONSES } from '../constants.js'
import logger from '../utilities/logger.js'
import { ChessGameStore, RedisGameStore, SimpleGameStore } from './ChessGameStore.js'
import type { TextBasedChannel, User } from 'discord.js'

type CreateGameOptions = {
  side: Color,
  fen: string,
  whiteUserId?: string,
  blackUserId?: string
}

type HandleMoveResult = HandleMoveSuccessResult | HandleMoveErrorResult

type HandleMoveSuccessResult = {
  reply: string,
  game: Chess,
  side: Color,
  move: Move
}

type HandleMoveErrorResult = {
  error: true,
  errorReply: string
}

class ChessService {
  store: ChessGameStore
  moveGenerator: (game: Chess) => string | null
  
  constructor({ store, moveGenerator }: { store: ChessGameStore, moveGenerator: (game: Chess) => string | null }) {
    this.store = store || new SimpleGameStore()
    this.moveGenerator = moveGenerator
  }

  generateMove(game: Chess) {
    return this.moveGenerator(game)
  }

  async handleMove(channel: TextBasedChannel, user: User, userMove: string): Promise<HandleMoveResult> {
    logger.debug(`Handling ${userMove} by ${user} in ${channel.id}`)
    const game = await this.getGame(channel, { createIfNotExists: true }) as Chess
    const side = game.turn()

    if (game.isGameOver()) {
      return {
        error: true,
        errorReply: ERROR_RESPONSES['NO_CHESS_GAME']
      }
    }

    if (user.id != this.getUserBySide(game, side)) {
      return {
        error: true,
        errorReply: ERROR_RESPONSES['NOT_YOUR_TURN'],
      }
    }

    // Attempt to make player's move
    let move;
    try {
      move = game.move(userMove)
    } catch (err) {
      const possibleMoves = game.moves()
      const closestMatchingMove = closestMatch(userMove, possibleMoves)
      return {
        error: true,
        errorReply: `Invalid move: **${userMove}**\n*Did you mean*: **${closestMatchingMove}**? Use \`/chess moves\` to see all possible moves.`,
      }
    }

    // If the user's move ended the game
    if (game.isCheckmate()) {
      // Update Game in Store
      logger.debug('Storing new chess game state...')
      this.store.updateGame(channel.id, game)

      return {
        reply: 'You win. Well played!',
        game: game,
        side: side,
        move: move
      }
    } else if (game.isGameOver()) {
      return {
        reply: 'It\'s a draw!',
        game: game,
        side: side,
        move: move
      }
    }

    if (!this.isBotGame(game, channel)) {
      this.store.updateGame(channel.id, game)
      const otherUserSide = side == 'w' ? 'b' : 'w';
      const otherUserId = this.getUserBySide(game, otherUserSide)
      logger.debug(`Other user: ${otherUserId}`)
      logger.debug(channel.client.users)
      const otherUser = await channel.client.users.fetch(otherUserId)
      return {
        reply: `${user} made the move: **${userMove}**. Your move, ${otherUser}!`,
        game: game,
        side: otherUserSide,
        move: move
      }
    }

    // Gnomebot makes a move
    const gnomeStringMove = this.generateMove(game)
    const gnomeMove = game.move(gnomeStringMove) // verbose move
    logger.debug(`Gnomebot making move in ${channel}: ${gnomeStringMove}`)

    // Update Game in Store
    logger.debug('Storing new chess game state...')
    this.store.updateGame(channel.id, game)

    // Check if gnomebot wins after moving
    if (game.isCheckmate()) {
      return {
        reply: `Nice try, but **${gnomeStringMove}** is checkmate. Better luck next time!`,
        game: game,
        side: side,
        move: gnomeMove
      }
    }

    // Game is not over
    return {
      reply: `Nice move! My move is **${gnomeStringMove}**.`,
      game: game,
      side: side,
      move: gnomeMove
    }
  }

  /**
   * Creates a chess game in a given channel
   * @param {String} channelId
   * @param {Object} options
   * @param {String} options.side
   * @param {String} options.fen
   * @returns {Promise<import('chess.js').Chess>}
   */
  async createGame(channelId: string, { side = 'w', fen, whiteUserId, blackUserId }: Partial<CreateGameOptions> = {}) {
    logger.info(`Creating new chess game for channel: ${channelId}`)
    const game = new Chess(fen)

    game.setHeader('White', whiteUserId || '')
    game.setHeader('Black', blackUserId || '')

    if (game.turn() != side) {
      const move = this.generateMove(game)

      logger.info(`Starting fen turn does not match desired side, making initial move: ${move}`)

      game.move(move)
    }

    logger.info(`Storing chess game state for channel: ${channelId}`)
    await this.store.updateGame(channelId, game)

    return game
  }

  isBotGame(game: Chess, channel: TextBasedChannel) {
    const botId = channel.client.user.id
    return game.getHeaders().White == botId || game.getHeaders().Black == botId
  }

  getUserBySide(game: Chess, side: Color) {
    const color = side == 'w' ? 'White' : 'Black'
    return game.getHeaders()[color]
  }

  /**
   * 
   * @param {import('discord.js').Channel} channel
   * @param {Object} options 
   * @param {Boolean} options.createIfNotExists 
   * @returns {Promise<import('chess.js').Chess?>}
   */
  async getGame(channel: TextBasedChannel, { createIfNotExists = false } = {}): Promise<Chess | null> {
    logger.debug(`Getting chess game for channel: ${channel.id}`)
    const game = await this.store.getGame(channel.id)

    if (!game && createIfNotExists) {
      logger.info(`No existing chess game found in channel: ${channel.id}`)
      return this.createGame(channel.id, { blackUserId: channel.client.user.id })
    }

    return game
  }

  async clearGame(channelId: string) {
    this.store.clearGame(channelId)
  }
}


const { REDIS_HOST } = process.env
const gameStore = REDIS_HOST ? new RedisGameStore(REDIS_HOST) : new SimpleGameStore()

if (gameStore instanceof RedisGameStore) {
  logger.info('Using redis-enabled chess game store')
}

/**
 * Generates a random move based on a given board position
 * @param {import('chess.js').Chess} game 
 */
const randomMove = (game: Chess) => _.sample(game.moves()) || null

const service = new ChessService({ store: gameStore, moveGenerator: randomMove })

export default service
