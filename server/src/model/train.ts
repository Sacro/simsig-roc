import iLocatable from './iLocatable.ts'
import { Phone } from './phone.ts'

export default class Train extends iLocatable {
  #uid: string
  #simId: string
  #headcode: string
  #phone: Phone | null = null
  // #passengers: Phone[] = []

  constructor(simId: string, uid: string, headcode: string) {
    super()
    this.#simId = simId
    this.#uid = uid
    this.#headcode = headcode
  }

  getSUID() {
    return this.#simId + this.#uid
  }

  // addPassenger(passenger: Phone) {
  //   this.#passengers.push(passenger)
  // }

  setPhone(phone: Phone) {
    this.#phone = phone
  }

  getHeadcode() {
    return this.#headcode
  }

  setHeadcode(headcode: string) {
    this.#headcode = headcode
  }

  getPhone() {
    return this.#phone
  }
}
