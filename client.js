const u = require("./u");

const { Client, IntentsBitField } = require("discord.js");
const fs = require("fs");

module.exports = {

    async boot(token) {

        u.log.log("Creating client");
        const client = new Client({
            "intents": [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMessages
            ]
        });
        u.cache.client = client;
        client.destroyed = false;
        
        u.log.log("Traversing events directory");
        u.dir.traverse(u.config.subsystems.events,(file,path) => {

            try {
                if(file.data && file.execute) {

                    if(file.once) client.on(file.data,file.execute);
                    else client.once(file.data,data.execute);

                }
                u.log.log("Successfully added event: " + path);
            } catch(e) {
                u.log.log("Error adding event: " + path + " || " + e.message);
            }

        });

        u.log.log("Logging in");
        client.login(token);

    }

}