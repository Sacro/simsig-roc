import { Phone } from './phone.ts'
import crypto from 'crypto'

export default class CallRequest {
  static TYPES = { P2P: 'p2p', GROUP: 'group', REC: 'REC' }
  static LEVELS = { NORMAL: 'normal', URGENT: 'urgent', EMERGENCY: 'emergency' }
  static STATUS = { OFFERED: 'offered', ACCEPTED: 'accepted', REJECTED: 'rejected', ENDED: 'ended' }
  id

  sender: Phone
  receivers: Phone[] = []
  timePlaced: number
  level: string
  status: string
  channel: string | undefined
  type: string

  constructor(sender: Phone, receiver: Phone | Phone[], type = CallRequest.TYPES.P2P, level: string = CallRequest.LEVELS.NORMAL) {
    this.sender = sender
    this.receivers = Array.isArray(receiver) ? receiver : new Array(receiver)
    this.type = type
    this.level = level
    this.id = crypto.randomUUID()
    this.timePlaced = Date.now()
    this.status = CallRequest.STATUS.OFFERED
  }

  getReceiver() {
    if (this.type === CallRequest.TYPES.P2P) {
      return this.receivers[0]
    }
    else {
      throw new Error()
    }
  }

  getReceivers() {
    console.log('getReceivers length', this.receivers.length)
    return this.receivers
  }

  setReceiver(receiver: Phone) {
    this.receivers = new Array(receiver)
  }

  isForPhone(phone: Phone) {
    this.receivers.find(r => r.getId() === phone.getId())
  }

  isFromPhone(phone: Phone) {
    return this.sender.getId() === phone.getId()
  }

  toEmittable() {
    return {
      id: this.id,
      timePlaced: this.timePlaced,
      level: this.level,
      status: this.status,
      sender: this.sender.toSimple(),
      receivers: this.receivers.map((r) => { return r.toSimple() }),
      type: this.type,
    }
  }
}
