import TrainLocationUpdate from '../stomp.ts'

export default class TrainLocationMessage {
  #simId: string
  #headcode: string
  #uid: string
  #action: string
  #location: string
  #platform: string
  #time: string
  #aspPass: string
  #aspAppr: string

  constructor(simId: string, msg: TrainLocationUpdate) {
    this.#simId = simId
    this.#headcode = msg.train_location.headcode
    this.#action = msg.train_location.action
    this.#aspAppr = msg.train_location.aspAppr
    this.#location = msg.train_location.location
    this.#platform = msg.train_location.platform
    this.#time = msg.train_location.time
    this.#uid = msg.train_location.uid
  }

  getUID() {
    return this.#uid
  }

  getSimId() {
    return this.#simId
  }

  getSUID() {
    return this.#simId + this.#uid
  }

  getHeadcode() {
    return this.#headcode
  }

  getLocation() {
    return this.#location
  }
}
