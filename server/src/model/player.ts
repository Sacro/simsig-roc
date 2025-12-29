import { Socket } from 'socket.io'
import Panel from './panel.ts'

export default class Player {
  #avatarURL = ''
  #displayName = ''

  #callQueue: unknown
  socket: Socket
  discordId: string
  #voiceChannelId: string
  #inCall: boolean
  #sim: string
  #isConnected: boolean

  #panel?: Panel

  constructor(socket: Socket, discordId: string, voiceChannelId: string) {
    this.socket = socket
    this.discordId = discordId
    this.#voiceChannelId = voiceChannelId
    this.#callQueue = {}
    this.#inCall = false
    this.#sim = ''
    this.#isConnected = true
  }

  setPanel(panel: Panel) {
    this.#panel = panel
  }

  toSimple() {
    return { discordId: this.discordId, displayName: this.#displayName, avatarURL: this.#avatarURL }
  }
}
