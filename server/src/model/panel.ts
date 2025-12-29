import Location from './location.ts'
import Phone from './phone.ts'

export default class Panel {
  id: string | undefined
  name: string | undefined
  player?: string
  neighbours: Location[] = []
  playerDetails: { id: string, displayName: string, avatarURL: string } | undefined
  phone?: Phone
  reportingLocations?: string[]

  static fromSimData(panelData: Panel) {
    const panel = new Panel()
    panel.id = panelData.id
    panel.name = panelData.name
    panelData.neighbours.forEach(p => panel.neighbours.push(p))
    return panelData
  }
}
