import type Location from './location.ts'

export default class iLocatable {
  #carrier: iLocatable | null = null

  #location: Location | null

  constructor(location: Location | null = null) {
    this.#location = location
  }

  getLocation(): Location | null {
    if (this.#carrier) {
      return this.#carrier.getLocation()
    }
    else {
      return this.#location
    }
  }

  setLocation(location: Location | null) {
    if (this.#carrier) {
      throw new Error('Attempting to set location of phone that has a carrier')
    }
    else {
      this.#location = location
    }
  }

  isInSameSim(loc: iLocatable) {
    const myLoc = this.getLocation()
    if (!loc.getLocation() || !myLoc) {
      return false
    }
    return myLoc.simId === loc.getLocation()?.simId
  }

  isInSamePanel(loc: iLocatable) {
    const myLoc = this.getLocation()
    if (!loc.getLocation() || !myLoc) {
      return false
    }
    return myLoc.simId === loc.getLocation()?.simId && myLoc.panelId === loc.getLocation()?.panelId
  }

  setCarrier(carrier: iLocatable) {
    this.#carrier = carrier
  }
}
