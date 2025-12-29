import chalk from 'chalk'
import { Socket } from 'socket.io'
import ROCManager from './ROCManager.ts'
import { PhoneManager } from './phonemanager.ts'

export function adminSockets(socket: Socket, gameManager: ROCManager, phoneManager: PhoneManager, config: unknown) {
  socket.on('adminLogin', (msg) => {
    if (config.superUsers.some(u => u === msg.discordId)) {
      gameManager.addAdminUser(msg, socket)
    }
    else {
      console.info(chalk.redBright('ACCESS DENIED. User is not Admin.'))
    }
  })

  socket.on('createPhone', (msg) => {
    console.log(chalk.yellow('createPhone'), msg)
    try {
      phoneManager.generatePhoneForPerson(msg.number, msg.name, msg.type, msg.location, msg.hidden)
      gameManager.sendGameUpdateToPlayers()
    }
    catch (error) {
      console.log(chalk.red('ERROR creating phone.'))
    }
  })

  socket.on('claimPhone', (msg) => {
    console.log('adminSockets claimPhone', msg.phoneId)
    const phone = phoneManager.getPhone(msg.phoneId)
    const player = gameManager.findPlayerBySocketId(socket.id)
    if (phone && player) {
      console.log(phone.toAdminView(), player.toSimple())
      phoneManager.assignPhone(phone, player)
      gameManager.sendGameUpdateToPlayers()
      gameManager.updateAdminUI()
    }
    else {
      console.log('ADMIN SOCKET claimPhone error')
    }
  })

  socket.on('releasePanel', (msg) => {
    console.log(chalk.yellow('releasePanel'), msg)
    gameManager.releasePanel(msg.player, msg.sim, msg.panel)
  })

  socket.on('enableInterfaceGateway', (msg) => {
    console.log(chalk.yellow('enableInterfaceGateway'), msg)
    gameManager.enableInterfaceGateway(msg.simId)
  })
  socket.on('disableInterfaceGateway', (msg) => {
    console.log(chalk.yellow('disableInterfaceGateway'), msg)
    gameManager.disableInterfaceGateway(msg.simId)
  })

  socket.on('enableConnections', (msg) => {
    console.log(chalk.yellow('enableConnections'), msg)
    gameManager.enableConnections(msg.simId)
  })
  socket.on('disableConnections', (msg) => {
    console.log(chalk.yellow('disableConnections'), msg)
    gameManager.disableConnections(msg.simId)
  })

  // kick the user from the call handler thingey socket yum
  socket.on('adminKickFromCall', (msg) => {
    gameManager.kickUserFromCall(msg)
  })
}
