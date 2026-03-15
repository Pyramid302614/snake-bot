const { EmbedBuilder } = require("@discordjs/builders");
const u = require("./u");

const { Client, IntentsBitField, REST, Routes, MessageFlags } = require("discord.js");
const fs = require("fs");

module.exports = {

    async boot(token) {

        u.log.log("Creating client");
        const client = new Client({
            "intents": [ // Intents are the permissions of the bot essentially
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMessages
            ]
        });
        u.cache.client = client;
        client.destroyed = false; // Marks it as undestroyed to be safe with if statements possibly null-checking it
        
        // Goes through the configured events directory and goes through every directory to find event files
        u.log.log("Traversing events directory");
        u.dir.traverse(u.config.subsystems.events,(file,path) => {

            try {
                if(file.data && file.execute) { // Only accepts files with "data" and "execute" property, "once" defaults to false

                    if(file.once) client.on(file.data,file.execute);
                    else client.once(file.data,data.execute);

                }
                u.log.log("Successfully added event: " + require("node:path").relative(process.cwd(),path));
            } catch(e) {
                u.log.log("Error adding event: " + path + " || " + e.message);
            }

        });

        // Goes through the configured commands directory and goes through every directory to find command files
        u.log.log("Traversing commands directory");
        const commandsExecute = {};
        const commandsData = [];
        u.dir.traverse(u.config.subsystems.commands,(file,path) => {

            try {
                if(file.data && file.execute) { // Only accepts files with "data" and "execute" property
                    commandsExecute[file.data.name] = file.execute;
                    commandsData.push(file);
                }
            } catch(e) {
                u.log.log("Error adding command: " + path + " || " + e.message);
            }

        });

        // Adds event listeners for the commands
        u.log.log("Configuring event listeners");
        client.on("interactionCreate",async (interaction) => {

            if(interaction.isChatInputCommand) try {
                // Actually executes the command
                await commandsExecute[interaction.commandName](interaction);
            } catch(e) {
                // If something goes wrong
                const msg = {
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(errtitles0[Math.floor(Math.random()*errtitles0.length)])
                            .setDescription("An error occurred while executing that command!\nIf you believe this is a mistake, report it in the `/server` and I will fix it!"+(u.adapter.chosenOnes.includes(interaction.user.id)?("\n```"+e.stack+"```"):""))
                            .setColor([255,0,0])
                    ],
                    flags: [ MessageFlags.Ephemeral ] // discord.js v15 heh
                }
                if(interaction.deferred) interaction.followUp(msg);
                else interaction.reply(msg);
            }

        });

        // Actually gets the commands over to discord, that way it can list what you can do
        u.log.log("Pushing application commands to Discord");
        const rest = new REST({ "version": 10 }).setToken(token);

        rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandsData }
        );

        u.log.log("Logging in");
        client.login(token);

    }

}

// For errors with
const errtitles0 = [
    "Bad news",
    "What????",
    "Damn",
    "That red message can't be good",
    "Welp",
    "Blame snake",
    "Oops",
    "Its not your fault... or is it?",
    ":despair:",
    "[Insert empathetic message here]",
    "Unlucky"
]
