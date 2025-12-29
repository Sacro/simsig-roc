// @ts-check
import ClockData from './clockData.ts'
import Panel from './panel.ts'

export default class Simulation {
  id?: string
  panels: Panel[] = []
  enabled = true
  connectionsOpen = true
  name: string | undefined
  config: { channel?: string, host?: string, port?: number, interfaceGateway?: { connected: boolean, enabled: boolean } } = {}

  locationToPanelMap = new Map<string, string>()

  time?: ClockData

  static fromSimData(simId: string, simData: Simulation) {
    const sim = new Simulation()
    sim.id = simId
    sim.name = simData.name
    simData.panels.forEach((panelData) => {
      sim.panels.push(Panel.fromSimData(panelData))
      for (const loc of panelData.reportingLocations ?? []) {
        if (panelData.id) {
          sim.locationToPanelMap.set(loc, panelData.id)
        }
      }
    })
    return sim
  }

  getPanel(panelId: string | null | undefined) {
    return this.panels.find(p => p.id === panelId,
    )
  }

  getPanelByLocation(location: string) {
    return this.locationToPanelMap.get(location)
  }
}
