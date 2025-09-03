import { Socket } from 'socket.io'

export default class Player {
  #avatarURL = ''
  #displayName = ''
  // #socket: Socket
  discordId: string
  // #voiceChannelId: string
  // #callQueue: unknown = {}
  // #inCall: boolean
  // #sim: string
  // #isConnected: boolean
  // #panel?: Panel

  constructor(_socket: Socket, discordId: string, _voiceChannelId: string | null) {
    // this.#socket = socket
    this.discordId = discordId
    // this.#voiceChannelId = voiceChannelId
    // this.#callQueue = {}
    // this.#inCall = false
    // this.#sim = ''
    // this.#isConnected = true
  }

  // setPanel(panel: Panel) {
  //   this.#panel = panel
  // }

  toSimple() {
    return { discordId: this.discordId, displayName: this.#displayName, avatarURL: this.#avatarURL }
  }
}
