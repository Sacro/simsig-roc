export default class Location {
  simId: string

  panelId: string | null

  constructor(simId: string, panelId: string | null = null) {
    this.simId = simId
    this.panelId = panelId
  }
}
