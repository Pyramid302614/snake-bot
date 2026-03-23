const { Events } = require("discord.js");
const rlog = require("../utilities/log/rlog");

module.exports = {
    
    data: Events.MessageUpdate,
    async execute(oldMsg,newMsg) {

    }

}