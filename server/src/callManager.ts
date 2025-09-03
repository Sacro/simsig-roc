//@ts-check
import chalk from 'chalk';
import CallRequest from './model/callrequest.js';
/** @typedef {import("./model/phone.js").default} Phone */
/** @typedef {import("./bot.js").default} DiscordBot */
/** @typedef {import("./phonemanager.js").default} PhoneManager */
/** @typedef {import("socket.io").Server} Server */
/** @typedef {import("socket.io").Socket} Socket */

export default class CallManager {

  privateCalls = {};
  //callQueue = {};

  /** @type {CallRequest[]} */
  requestedCalls = [];
  /** @type {CallRequest[]} */
  ongoingCalls = [];
  /** @type {CallRequest[]} */
  pastCalls = [];


  /**
   * 
   * @param {PhoneManager} phoneManager 
   * @param {DiscordBot} bot 
   * @param {Server} io 
   */
  constructor(phoneManager, bot, io) {
    this.phoneManager = phoneManager;
    this.bot = bot;
    this.io = io;
  }


  /**
   * 
   * @param {Phone} phone 
   * @returns {CallRequest[]}
   */
  getCallQueueForPhone(phone) {
    const requestedCalls = this.requestedCalls.filter((c) => c.isForPhone(phone) || c.isFromPhone(phone));
    const ongoingCalls = this.ongoingCalls.filter((c) => c.isForPhone(phone) || c.isFromPhone(phone));
    const pastCalls = this.pastCalls.filter((c) => c.isForPhone(phone) || c.isFromPhone(phone));
    const toNowCalls = requestedCalls.concat(ongoingCalls)

    const lastCall = pastCalls.pop();

    if (typeof lastCall !== 'undefined') {
      toNowCalls.push(lastCall);
    }

    return toNowCalls;
  }


  /**
   * 
   * @param {string} socketId 
   * @param {string} callType 
   * @param {string} callLevel
   * @param {string} senderPhoneId 
   * @param {object[]|null} receiverPhones 
   * @returns 
   */
  placeCall(socketId, callType, callLevel, senderPhoneId, receiverPhones = null) {
    if (typeof this.phoneManager.getPhone(senderPhoneId) === 'undefined') {
      console.warn(chalk.yellow('placeCall'), chalk.red("Sender phone not valid: "), senderPhoneId);
      return false;
    }

    if (this.phoneManager.getPhone(senderPhoneId).getDiscordId() === null) {
      console.warn(chalk.yellow('placeCall'), chalk.red("Sender phone not assigned to a player: "), senderPhoneId);
      return false;
    }

    const sendingPhone = this.phoneManager.getPhone(senderPhoneId);

    const sendingPlayerId = sendingPhone.getDiscordId();

    let callRequest;

    if (callType === CallRequest.TYPES.P2P) {
      let receiverPhoneId
      if(typeof receiverPhones === "object") {
        receiverPhoneId = receiverPhones[0].id;
      } else {
        receiverPhoneId = receiverPhones;
      }

      if (typeof this.phoneManager.getPhone(receiverPhoneId) === 'undefined') {
        console.warn(chalk.yellow('placeCall'), chalk.red("Receiver phone not valid: "), receiverPhoneId, senderPhoneId);
        return false;
      }

      if (this.phoneManager.getPhone(receiverPhoneId).getDiscordId() === null) {
        console.warn(chalk.yellow('placeCall'), chalk.red("Receiver phone not assigned to a player: "), receiverPhoneId, senderPhoneId);
        return false;
      }
      const receivingPhone = this.phoneManager.getPhone(receiverPhoneId);
      const receivingPlayerId = receivingPhone.getDiscordId();

      if (sendingPlayerId !== receivingPlayerId) {
        //console.info(chalk.yellow("Placing Call"), chalk.magentaBright("Caller:"), sendingPlayerId, chalk.magentaBright("Reciever:"), receivingPlayerId);
        callRequest = new CallRequest(sendingPhone, receivingPhone);
      } else {
        console.info(chalk.yellow('placeCall'), chalk.yellow("A player ("), sendingPlayerId, chalk.yellow(") tried to call themselves as was rejected."));
        return false
      }
    } else if (callType === CallRequest.TYPES.REC) {
      const recPhones = this.phoneManager.getRECRecipientsForPhone(sendingPhone);
      if (recPhones.length > 0) {
        console.log(chalk.magenta('RECPHONES'), typeof recPhones, Array.isArray(recPhones), recPhones);
        callRequest = new CallRequest(sendingPhone, recPhones, CallRequest.TYPES.REC, CallRequest.LEVELS.EMERGENCY);
      } else {
        console.info(chalk.yellow('placeCall'), chalk.yellow("A player ("), sendingPlayerId, chalk.yellow(") tried to REC but there were no receivers."));
        return false
      }
    } else {
      console.info(chalk.yellow('placeCall'), chalk.yellow("A player ("), sendingPlayerId, chalk.yellow(") tried to place an invalid call type."), callType);
      return false;
    }

    this.requestedCalls.push(callRequest);

    console.log(chalk.yellow("Placing call"), callRequest.toEmittable());

    this.sendCallQueueUpdateToPhones(callRequest.getReceivers());
    this.sendCallQueueUpdateToPhones([callRequest.sender]);

    return callRequest.id;

  }

  requestPhoneQueueUpdate(phoneId) {
    const phone = this.phoneManager.getPhone(phoneId);
    if (typeof phone === 'undefined') {
      console.warn(chalk.yellow('requestPhoneQueueUpdate'), 'Phone not found', phoneId);
      return false;
    }
    this.sendCallQueueUpdateToPhones([phone]);
  }


  /**
   * 
   * @param {Phone[]} receivers 
   */
  sendCallQueueUpdateToPhones(receivers) {
    receivers.forEach((phone) => {
      const queue = this.getCallQueueForPhone(phone);
      const emittableQueue = queue.map((r) => r.toEmittable());
      this.io.to(phone.getDiscordId()).emit('callQueueUpdate', { 'phoneId': phone.getId(), 'queue': emittableQueue });
    });
  }

  /**
   * 
   * @param {Socket} socket 
   * @param {string} callId 
   * @returns 
   */
  async acceptCall(socket, callId) {
    const callRequest = this.requestedCalls.some(x => x.id === callId) ? this.requestedCalls.find(x => x.id === callId) : this.ongoingCalls.find(x => x.id === callId);

    if (typeof callRequest === 'undefined') {
      console.log(chalk.yellow('acceptCall'), socket.id, 'attempting to accept undefined call', callId);
      return false;
    }

    const channelId = this.bot.getAvailableCallChannel();
    if (channelId === null) {
      console.log(chalk.yellow('acceptCall'), socket.id, 'No channel available for call', callId);
      this.rejectCall(socket.id, callId);
      return false;
    }

    callRequest.channel = channelId;

    // @ts-expect-error
    if (!(callRequest.getReceivers().some(p => p.getDiscordId() === socket.discordId))) {
      console.log(chalk.yellow('acceptCall'), socket.id, 'The person answering is not on the call?', callId);
      this.rejectCall(socket.id, callId);
      return false;
    }

    // @ts-expect-error
    const moveSocketResult = await this.movePlayerToCall(socket.discordId, callRequest.channel)
    if(!moveSocketResult) {
      console.log(chalk.yellow('acceptCall'), socket.id, 'Failed to move player to call', callId);
      this.rejectCall(socket.id, callId);
      return false;
    }
    console.log('accepted', callRequest);
    if (callRequest.status === CallRequest.STATUS.OFFERED) {
      console.log(chalk.yellow('acceptCall'), 'Moving sender to call...', callId);
      const result = await this.movePlayerToCall(callRequest.sender.getDiscordId(), callRequest.channel);
      if(!result) {
        console.log(chalk.red('acceptCall'), socket.id, 'Failed to move sender to call', callId);
        this.rejectCall(socket.id, callId);
        // @ts-expect-error
        await this.bot.setUserVoiceChannel(socket.discordId);
        return false;
      }
    }

    if (callRequest.status === CallRequest.STATUS.OFFERED) {
      this.requestedCalls = this.requestedCalls.filter(c => c.id !== callId);
      callRequest.status = CallRequest.STATUS.ACCEPTED;
      this.ongoingCalls.push(callRequest);
      this.sendCallQueueUpdateToPhones(callRequest.getReceivers());
      this.sendCallQueueUpdateToPhones([callRequest.sender]);
    }

    return true;
  }

  /**
   * 
   * @param {string} socketId 
   * @param {string} callId 
   * @returns 
   */
  rejectCall(socketId, callId) {
    const call = this.requestedCalls.find(c => c.id === callId);
    if (typeof call === 'undefined') {
      console.log(chalk.yellow('rejectCall'), socketId, 'attempting to reject undefined call', callId);
      return false;
    }

    call.status = CallRequest.STATUS.REJECTED;
    this.requestedCalls = this.requestedCalls.filter(c => c.id !== callId);
    this.pastCalls.push(call);
    this.bot.releasePrivateCallChannelReservation(call.channel)
    
    if (call.type === CallRequest.TYPES.P2P) {
      this.sendCallQueueUpdateToPhones(call.getReceivers());
      this.sendCallQueueUpdateToPhones([call.sender]);
    }
  }

  /**
   * 
   * @param {string} discordId 
   * @param {string} call 
   * @returns 
   */
  async movePlayerToCall(discordId, call) {
    console.log(chalk.blueBright("callManager"), chalk.yellow("movePlayerToCall"), discordId, call);
    const result = await this.bot.setUserVoiceChannel(discordId, call);
    return result;
  }

  /**
   * 
   * @param {string} socketId 
   * @param {string} callId 
   */
  async leaveCall(socketId, callId) {
    console.log('leaving', callId);
    const call = this.ongoingCalls.find(c => c.id === callId);
    if (typeof call !== 'undefined') {
      if (call.type === CallRequest.TYPES.P2P) {
        //@ts-expect-error
        const leaversDiscordId = this.io.sockets.sockets.get(socketId).discordId


        await this.bot.setUserVoiceChannel(call.sender.getDiscordId());
        await this.bot.setUserVoiceChannel(call.getReceiver().getDiscordId());

        if (leaversDiscordId === call.sender.getDiscordId()) {
          this.io.to(call.getReceiver().getDiscordId()).emit("kickedFromCall", { "success": true });
        } else {
          this.io.to(call.sender.getDiscordId()).emit("kickedFromCall", { "success": true });
        }

        call.status = CallRequest.STATUS.ENDED;
        this.ongoingCalls = this.ongoingCalls.filter(c => c.id !== callId);
        this.pastCalls.push(call);
        this.sendCallQueueUpdateToPhones(call.getReceivers());
        this.sendCallQueueUpdateToPhones([call.sender]);
      }

    } else {
      console.info(chalk.yellow('leaveCall'), 'Call already terminated.', callId)
    }
  }


  // =============================== END CALL CODE ===============================

  // REc
  playerJoinREC(playerId, channelId) {
    console.log(chalk.yellow("Player joining REC:"), chalk.white(playerId));
    this.movePlayerToCall(playerId, channelId);
    this.io.to(playerId).emit("joinedCall", { "success": true });
  }

  kickUserFromCall(discordId) {
    console.log(discordId);
  }
}