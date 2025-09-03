import { Client } from '@stomp/stompjs'

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
