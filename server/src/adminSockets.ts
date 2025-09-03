import chalk from 'chalk';
/** @typedef {import("./ROCManager.js").default} ROCManager */
/** @typedef {import("./phonemanager.js").default} PhoneManager */
/** @typedef {import("socket.io").Socket} Socket */

/**
 * 
 * @param {Socket} socket 
 * @param {ROCManager} gameManager 
 * @param {PhoneManager} phoneManager 
 * @param {*} config 
 */
export function adminSockets(socket, gameManager, phoneManager, config) {
  socket.on("adminLogin", function (msg) {
    if (config.superUsers.some(u => u === msg.discordId)) {
      gameManager.addAdminUser(msg, socket);
    }
    else {
      console.info(chalk.redBright("ACCESS DENIED. User is not Admin."));
    }
  });

  socket.on("createPhone", function (msg) {
    console.log(chalk.yellow('createPhone'), msg)
    try {
      phoneManager.generatePhoneForPerson(msg.number, msg.name, msg.type, msg.location, msg.hidden)
      gameManager.sendGameUpdateToPlayers();
    } catch (error) {
      console.log(chalk.red('ERROR creating phone.'));
    }
  });

  socket.on('claimPhone', function (msg) {
    console.log('adminSockets claimPhone', msg.phoneId)
    const phone = phoneManager.getPhone(msg.phoneId);
    const player = gameManager.findPlayerBySocketId(socket.id);
    if(phone && player) {
      console.log(phone.toAdminView(), player.toSimple());
      phoneManager.assignPhone(phone,player);
      gameManager.sendGameUpdateToPlayers();
      gameManager.updateAdminUI();
    } else {
      console.log('ADMIN SOCKET claimPhone error');
    }
  })

  socket.on("enableInterfaceGateway", function (msg) {
    console.log(chalk.yellow('enableInterfaceGateway'), msg)
    gameManager.enableInterfaceGateway(msg.simId);
  });
  socket.on("disableInterfaceGateway", function (msg) {
    console.log(chalk.yellow('disableInterfaceGateway'), msg)
    gameManager.disableInterfaceGateway(msg.simId);
  });

  socket.on("enableConnections", function (msg) {
    console.log(chalk.yellow('enableConnections'), msg)
    gameManager.enableConnections(msg.simId);
  });
  socket.on("disableConnections", function (msg) {
    console.log(chalk.yellow('disableConnections'), msg)
    gameManager.disableConnections(msg.simId);
  });

  // kick the user from the call handler thingey socket yum
  socket.on("adminKickFromCall", function (msg) {
    gameManager.kickUserFromCall(msg);
  });
}