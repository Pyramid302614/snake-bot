const { Events, ActivityType } = require("discord.js");
const u = require("../u");

module.exports = {
    
    data: Events.ClientReady,
    once: true,
    
    async execute(client) {

        u.log.log("Snake bot is ready as \x1b[33m" + client.user.username + "\x1b[0m!");
        client.user.setPresence({
            activities: [
                // {
                //     type: ActivityType.Custom, name: ""
                // }
            ],
            status: "online"
        });

    }
}