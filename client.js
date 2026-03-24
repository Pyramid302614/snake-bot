const { EmbedBuilder } = require("@discordjs/builders");
const u = require("./u");

const { Client, IntentsBitField, REST, Routes, MessageFlags, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {

    async boot(token) {

        const client = new Client({
            "intents": [ // Intents are the permissions of the bot essentially
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMessages
            ]
        });
        u.cache.client = client;
        client.started = true;
        
        // Goes through the configured events directory and goes through every directory to find event files
        u.log.log("Traversing events directory");
        u.dir.traverse(u.config.subsystems.events,(file,path) => {

            try {
                if(file.data && file.execute) { // Only accepts files with "data" and "execute" property, "once" defaults to false

                    if(!file.once) client.on(file.data,file.execute);
                    else client.once(file.data,file.execute);

                }
                u.log.log("Successfully added event: " + require("node:path").relative(process.cwd(),path));
            } catch(e) {
                u.log.log("Error adding event: " + require("node:path").relative(process.cwd(),path) + " || " + e.message);
            }

        });

        // Goes through the configured commands directory and goes through every directory to find command files
        u.log.log("Traversing commands directory");
        const commandsExecute = {};
        const commandsData = [];
        const commands = [];
        u.dir.traverse(u.config.subsystems.commands,(file,path) => {

            try {
                if(file.data && file.execute) { // Only accepts files with "data" and "execute" property
                    file.data.contexts = require("./utilities/commands/contexts.js").customToDiscord(file.contexts??[]);
                    commandsExecute[file.data.name] = file.execute;
                    commandsData.push(file.data);
                    commands[file.data.name] = file;
                    u.log.log("Successfully added command: " + require("node:path").relative(process.cwd(),path))
                }
            } catch(e) {
                u.log.log("Error adding command: " + require("node:path").relative(process.cwd(),path) + " || " + e.message);
            }

        });

        // Adds event listeners for the commands
        u.log.log("Configuring event listeners");
        client.on("interactionCreate",async (interaction) => {

            if(interaction.isChatInputCommand()) try {
                if(await require("./utilities/commands/contexts.js").processCommand(interaction,commands[interaction.commandName].contexts)) return; // Replies within that function
                // Actually executes the command
                await commandsExecute[interaction.commandName](interaction);
            } catch(e) {
                // If something goes wrong
                const msg = {
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(u.errTitles.generalPack[Math.floor(Math.random()*u.errTitles.generalPack.length)])
                            .setDescription("An error occurred while executing that command!\nIf you believe this is a mistake, report it in the `/server` and I will fix it!"+(u.adapter.config30.chosen_ones.includes(interaction.user.id)?("\n```"+e.stack+"```"):""))
                            .setColor([255,0,0])
                    ],
                    flags: [ MessageFlags.Ephemeral ] // discord.js v15 heh
                }
                if(interaction.deferred || interaction.replied) interaction.followUp(msg);
                else interaction.reply(msg);
            }

            if(interaction.isChannelSelectMenu() || interaction.isButton()) {
                
                require("./utilities//commands/messageElements.js").interaction(interaction);

            }

        });

        // Logs in (Required for pushing commands, because you need client id)
        u.log.log("Logging in");
        client.login(token);

        await new Promise(resolve => setInterval(() => {
            if(client.isReady()) resolve();
        },200))

        // Actually gets the commands over to discord, that way it can list what you can do
        u.log.log("Pushing application commands to Discord");
        const rest = new REST({ "version": 10 }).setToken(token);

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandsData }
        );

        u.log.log("Pushed " + commandsData.length + " application commands.");

    }

}



// Snake you prob think I code all this on github dont you