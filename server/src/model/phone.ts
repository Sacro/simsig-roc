import iLocatable from './iLocatable.ts'
import type Location from './location.ts'
import PhonebookEntry from './phonebookentry.ts'
import Player from './player.ts'

export class Phone extends iLocatable {
  static TYPES = { FIXED: 'fixed', TRAIN: 'train', MOBILE: 'Mobile' }

  #id: string
  #name: string
  readonly #type: string
  #player: Player | null
  // @ts-expect-error #hidden is unused
  // eslint-disable-next-line no-unused-private-class-members
  #hidden: boolean

  #speedDial = {}
  #trainsAndMobiles = {}

  constructor(id: string, name: string, type: string, location?: Location | null, hidden = false) {
    super(location)
    this.#id = id
    this.#name = name
    this.#type = type
    this.#player = null
    this.#hidden = hidden
  }

  getId() {
    return this.#id
  }

  isType(typeString: string) {
    return this.#type === typeString
  }

  getDiscordId() {
    if (this.#player) {
      return this.#player.discordId
    }
    else {
      return null
    }
  }

  getPlayer() {
    return this.#player
  }

  setPlayer(player: Player) {
    this.#player = player
  }

  getName() {
    return this.#name
  }

  setName(name: string) {
    this.#name = name
  }

  setTrainsAndMobiles(phones: PhonebookEntry[]) {
    this.#trainsAndMobiles = phones
  }

  setSpeedDial(phones: PhonebookEntry[]) {
    this.#speedDial = phones
  }

  toSimple() {
    return new PhonebookEntry(this.#id, this.#name, this.#type)
  }

  toAdminView() {
    const playerData = this.#player ? this.#player.toSimple() : undefined
    return {
      id: this.#id,
      name: this.#name,
      type: this.#type,
      location: super.getLocation(),
      player: playerData,
    }
  }

  getPhoneBook() {
    const phone: PhonebookEntry & { speedDial?: object, trainsAndMobiles?: object } = this.toSimple()
    phone.speedDial = this.#speedDial
    phone.trainsAndMobiles = this.#trainsAndMobiles
    return phone
  }
}
