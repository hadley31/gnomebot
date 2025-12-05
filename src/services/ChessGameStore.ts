import { createClient } from 'redis'
import { Chess } from 'chess.js'
import logger from '../utilities/logger.js'

export class ChessGameStore {
  /**
   * Retrieves the current game for the given channel id
   * @param {String} channelId The channel id
   * @returns {Promise<import('chess.js').Chess?>}
   */
  async getGame(channelId: string): Promise<Chess | null> {
    throw Error('Not Implemented!')
  }

  /**
   * Updates or sets a game for the given channel id
   * @param {String} channelId The channel id
   * @param {import('chess.js').Chess} game 
   */
  async updateGame(channelId: string, game: Chess) {
    throw Error('Not Implemented!')
  }

  /**
   * Clears the game for the given channel id
   * @param channelId The channel id
   */
  async clearGame(channelId: string) {
    throw Error('Not Implemented!')
  }
}

export class SimpleGameStore extends ChessGameStore {
  store: Record<string, Chess>
  constructor() {
    super()
    this.store = {}
  }

  async getGame(channelId: string) {
    const key = this.getKey(channelId)
    return this.store[key]
  }

  async updateGame(channelId: string, game: Chess) {
    const key = this.getKey(channelId)

    if (game) {
      this.store[key] = game
    } else {
      delete this.store[channelId]
    }
  }

  async clearGame(channelId: string) {
    const key = this.getKey(channelId)
    if (this.store[key]) {
      delete this.store[key]
    }
  }

  getKey(channelId: string) {
    return `cg_${channelId}`
  }
}


export class RedisGameStore extends ChessGameStore {
  host: string
  port: number
  client: ReturnType<typeof createClient>

  constructor(host: string, port: number = 6379) {
    super()
    this.host = host
    this.port = port
    this.client = createClient({ url: `redis://${host}:${port}` })
  }

  async getGame(channelId: string) {
    if (!this.client.isOpen) await this.client.connect()
    const key = this.getKey(channelId)
    const pgn = await this.client.get(key)

    logger.info(`channel: ${channelId} pgn: ${pgn}`)
    if (!pgn) {
      return null
    }

    const game = new Chess()

    game.loadPgn(pgn)

    return game
  }

  async updateGame(channelId: string, game: Chess) {
    if (!this.client.isOpen) await this.client.connect()
    const key = this.getKey(channelId)
    this.client.set(key, game.pgn())
  }

  async clearGame(channelId: string) {
    if (!this.client.isOpen) await this.client.connect()
    const key = this.getKey(channelId)
    this.client.del(key)
  }

  getKey(channelId: string) {
    return `cg_${channelId}`
  }
}