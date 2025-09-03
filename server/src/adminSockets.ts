import chalk from 'chalk'
import { Socket } from 'socket.io'
import ROCManager from './ROCManager.ts'
import PhoneManager from './phonemanager.ts'

interface Config {
  superUsers: string[]
}

export function adminSockets(socket: Socket, gameManager: ROCManager, phoneManager: PhoneManager, config: Config) {
  socket.on('adminLogin', async function (msg: { discordId: string }) {
    if (config.superUsers.some(u => u === msg.discordId)) {
      await gameManager.addAdminUser(msg, socket)
    }
    else {
      console.info(chalk.redBright('ACCESS DENIED. User is not Admin.'))
    }
  })

  socket.on('createPhone', function (msg: { number: string, name: string, type: string, location?: null, incident: string, hidden: boolean }) {
    console.log(chalk.yellow('createPhone'), msg)
    try {
      phoneManager.generatePhoneForPerson(msg.number, msg.name, msg.type, msg.location, msg.hidden)
      gameManager.sendGameUpdateToPlayers()
    }
    catch (error) {
      console.log(chalk.red('ERROR creating phone.', error))
    }
  })

  socket.on('claimPhone', function (msg: { phoneId: string }) {
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

  socket.on('enableInterfaceGateway', function (msg) {
    console.log(chalk.yellow('enableInterfaceGateway'), msg)
    gameManager.enableInterfaceGateway(msg.simId)
  })

  socket.on('disableInterfaceGateway', function (msg) {
    console.log(chalk.yellow('disableInterfaceGateway'), msg)
    gameManager.disableInterfaceGateway(msg.simId)
  })

  socket.on('enableConnections', function (msg) {
    console.log(chalk.yellow('enableConnections'), msg)
    gameManager.enableConnections(msg.simId)
  })

  socket.on('disableConnections', function (msg) {
    console.log(chalk.yellow('disableConnections'), msg)
    gameManager.disableConnections(msg.simId)
  })

  // kick the user from the call handler thingey socket yum
  socket.on('adminKickFromCall', function (msg) {
    gameManager.kickUserFromCall(msg)
  })
}
