const { Events } = require("discord.js");

module.exports = {
    data: Events.ClientReady,
    once: true,
    async execute(client) {

        console.log("Snake bot is ready as " + client.user.username + "!");

    }
}