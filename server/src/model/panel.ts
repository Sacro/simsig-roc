import Player from './player.ts'
import { Phone } from './phone.ts'
import type Location from './location.ts'

export default class Panel {
  id?: string
  name?: string
  player?: Player
  neighbours: Location[] = []

  phone?: Phone

  static fromSimData(panelData: { id: string, name: string, neighbours: Location[] }) {
    const panel = new Panel()
    panel.id = panelData.id
    panel.name = panelData.name
    panelData.neighbours.forEach(p => panel.neighbours.push(p))
    return panelData // TODO: should this not be 'panel'?
  }
}
