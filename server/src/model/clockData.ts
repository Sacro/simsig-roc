export default class ClockData {
  isPaused: boolean | undefined
  secondsSinceMidnight: number | undefined
  lastReportedAt = Date.now()
  speed: number | undefined

  static fromSimMessage(simMsg: { area_id: string, clock: number, interval: number, paused: boolean }) {
    const clockData = new ClockData()
    clockData.isPaused = simMsg.paused
    // interval is how many ms between updates
    // SimSig does 2 updates per simulated second
    // so realtime is an interval of 500
    clockData.speed = 500 / simMsg.interval
    clockData.speed = Math.min(clockData.speed, 32)
    clockData.secondsSinceMidnight = simMsg.clock
    return clockData
  }
}
