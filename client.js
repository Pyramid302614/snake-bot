const u = require("./u");

const { Client, IntentsBitField } = require("discord.js");
const fs = require("fs");

module.exports = {

    async boot(token) {

        console.log("Creating client");
        u.cache.client(
            new Client({
                "intents": [
                    IntentsBitField.Flags.Guilds,
                    IntentsBitField.Flags.GuildMembers,
                    IntentsBitField.Flags.MessageContent,
                    IntentsBitField.Flags.GuildMessages
                ]
            })
        );

        const client = u.cache.client;

        
        console.log("Traversing events directory"); 
        const eventsDir = fs.readdirSync(u.config.subsystems.events);
        // for(const item) {

        // }
        


    }

}