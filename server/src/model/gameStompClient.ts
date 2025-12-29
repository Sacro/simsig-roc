import { Client } from '@stomp/stompjs'

/**
 * Repesents a container for a STOMP client for a Game.
 */
export default class GameStompClient {
  id: string

  client: Client

  game: unknown

  constructor(id: string, game: unknown, client: Client) {
    this.id = id
    this.game = game
    this.client = client
  }
}
