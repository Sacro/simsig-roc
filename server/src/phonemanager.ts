import chalk from 'chalk'

import { Phone } from './model/phone.ts'
import Location from './model/location.ts'
import Panel from './model/panel.ts'
import ROCManager from './ROCManager.ts'
import Simulation from './model/simulation.ts'
import Train from './model/train.ts'
import Player from './model/player.ts'

export default class PhoneManager {
  phones: Phone[] = []

  sims: Simulation[] = []

  generatePhonesForSim(sim: Simulation) {
    // Create a phone for each panel in the sim.
    sim.panels.forEach((panel) => {
      const phone = this.generatePhoneForPanel(sim, panel)
      console.log(chalk.yellow('generatePhonesForSim Added phone: '), phone.toAdminView())
      panel.phone = phone
    })

    // Create a phone for Control
    // TODO: Add ability to configure additional phones for the Sim.
    this.phones.push(new Phone(sim.id + '_control', sim.name + ' Control', Phone.TYPES.FIXED, new Location(sim.id)))

    this.sims.push(sim)

    // console.log(chalk.yellow('generatePhonesForSim'), this.phones);
  }

  generatePhoneForTrain(train: Train): Phone {
    const phone = new Phone(train.getSUID(), train.getHeadcode(), Phone.TYPES.TRAIN)
    phone.setCarrier(train)
    this.phones.push(phone)
    return phone
  }

  generatePhoneForPanel(sim: Simulation, panel: Panel): Phone {
    const phone = new Phone(sim.id + '_' + panel.id, sim.name + ' ' + panel.name, Phone.TYPES.FIXED, new Location(sim.id, panel.id))
    this.phones.push(phone)
    return phone
  }

  generatePhoneForPerson(number: string, name: string, type: string = Phone.TYPES.MOBILE, location?: Location | null, hidden = false, ...args: unknown[]) {
    console.log(chalk.yellow('generatePhoneForPerson'), ...args)
    if (number && !this.phones.some(p => p.getId() === number)) {
      console.log('created phone')
      const phone = new Phone(number, name, type, location, hidden)
      this.phones.push(phone)
      return phone
    }
    else {
      throw new Error('Invalid number or number already exists')
    }
  }

  generateMissingNeighbourPhones(rocManager: ROCManager) {
    console.log(this)

    this.sims.forEach((sim) => {
      sim.panels.forEach((p) => {
        p.neighbours.forEach((neighbour) => {
          // Assume phones within the same sim are always generated together
          if (neighbour.simId !== sim.id) {
            const px = this.getPhone(neighbour.simId + '_' + neighbour.panelId)
            if (!px) {
              const neighbourSim = rocManager.getSimData(neighbour.simId)
              this.generatePhoneForPanel(neighbourSim, neighbourSim.getPanel(neighbour.panelId))
            }
          }
        })
      })
    })
    console.log('Generated neighbour phones')
  }

  getSpeedDialForPhone(phone: Phone) {
    let phones: Phone[] = []

    if (phone.getLocation() !== null) {
      const sim = this.sims.find(x => x.id === phone.getLocation().simId)
      if (sim) {
        const panel = sim.getPanel(phone.getLocation().panelId)
        if (panel) {
          const neighbourPhones = panel.neighbours.map((nb) => {
            this.getPhone(nb.simId + '_' + nb.panelId)
          }, this)
          phones = phones.concat(neighbourPhones)
        }
        const control = this.phones.filter(x => x.getId() === sim.id + '_control' && x.getId() !== phone.getId())
        phones = phones.concat(control)
      }
    }
    else {
      console.log('Phone has no location')
    }

    return phones.map(p => p.toSimple())
  }

  getTrainsAndMobilesForPhone(phone: Phone) {
    const trainPhones = this.phones.filter(p => p.isInSameSim(phone) && p.isType(Phone.TYPES.TRAIN)).map(p => p.toSimple())
    const mobilePhones = this.phones.filter(p => p.isInSameSim(phone) && p.isType(Phone.TYPES.MOBILE)).map(p => p.toSimple())
    return trainPhones.concat(mobilePhones)
  }

  getRECRecipientsForPhone(phone: Phone) {
    let phones: Phone[] = []

    // Find the location of the phone
    const sim = this.sims.find(s => s.id === phone.getLocation().simId)
    const panel = sim.getPanel(phone.getLocation().panelId)

    const neighbourPhones = panel.neighbours.map((nb) => {
      this.getPhone(nb.simId + '_' + nb.panelId)
    }, this)

    phones = phones.concat(neighbourPhones)
    console.log(chalk.redBright('REC neighbourphones'), neighbourPhones.length, neighbourPhones)

    // Include control
    const control = this.phones.find(x => x.getId() === sim.id + '_control' && x.getDiscordId() !== null)
    if (control) {
      phones = phones.concat(control)
      console.log(chalk.redBright('REC phones'), control.toSimple())
    }

    return phones
  }

  getPhone(phoneId: string) {
    return this.phones.find(p => p.getId() === phoneId)
  }

  getAllPhones() {
    return this.phones.map(p => p.toAdminView())
  }

  assignPhone(phone: Phone, player: Player) {
    if (typeof phone === 'undefined') {
      console.log(chalk.yellow('assignPhone'), 'Phone is undefined')
      return false
    }
    phone.setPlayer(player)
    this.sendPhonebookUpdateToPlayer(player)
    return true
  }

  unassignPhone(phone: Phone) {
    if (typeof phone === 'undefined') {
      console.log(chalk.yellow('assignPhone'), 'Phone is undefined')
      return false
    }
    const player = phone.getPlayer()
    phone.setPlayer(null)
    this.sendPhonebookUpdateToPlayer(player)
    return true
  }

  unassignPhonesForDiscordId(discordId: string) {
    const phones = this.getPhonesForDiscordId(discordId)
    phones.forEach((p) => {
      p.setPlayer(null)
    })
    this.sendPhonebookUpdateToPlayer(discordId)
  }

  getPhonesForDiscordId(discordId: string) {
    return this.phones.filter(p => p.getDiscordId() === discordId)
  }

  sendPhonebookUpdateToPlayer(player: Player) {
    const phones = this.getPhonesForDiscordId(player.discordId)
    phones.forEach((p) => {
      p.setSpeedDial(this.getSpeedDialForPhone(p))
      p.setTrainsAndMobiles(this.getTrainsAndMobilesForPhone(p))
    })
    const book = phones.map(p => p.getPhoneBook())
    if (player.socket) {
      console.log('Sending phonebook update', book)
      player.socket.emit('phonebookUpdate', book)
    }
    else {
      console.log(chalk.magenta('sendPhonebookUpdateToPlayer'), 'No socket for player', player.discordId)
    }
  }
}
