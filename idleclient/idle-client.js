const { Client, IntentsBitField, MessageFlags } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");

const adapter = require("../snakelet/adapter.js");

module.exports = {

    client: null,
    
    async boot() {

        // Forces no duplicates
        if(this.client) return;

        const token = adapter.chip?adapter.config30.beetroot_token:adapter.config30.chipmunk_token;

        this.client = new Client({
            "intents": [
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.Guilds,
            ]
        });

        // Simply listens for interactions, it doesn't have any itself.
        // If you were to start snakelet as chip, but also start idle client as chip, then it would listen for snakelet commands instead of snakebot commands
        this.client.on("interactionCreate",async (interaction) => {
            if([undefined,true].includes(!adapter.started)) {
                // undefined: not started yet
                // true: destroyed
                try  {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(errtitles0[Math.floor(Math.random()*errtitles0.length)])
                                // ah yes dont we all love endless strings
                                .setDescription("Snake bot isn't on right now. Here's some reasons why this might be:\n\n1. Pyramid might be restarting the bot right now to pull some updates, which should be quick.\n2. Snake bot could've crashed, which is not good, feel free to spam ping @pyramid302614.\n3. Snake bot could've aborted, which could be for a security reason, meaning it probably won't be on for a bit. Still spam ping pyramid though.")
                                .setColor([255,0,0])
                        ],
                        flags: [ MessageFlags.Ephemeral ]
                    });
                } catch(ignored) {}
            }
            
        });

        this.client.login(token);

        await new Promise(resolve => this.client.on("clientReady",resolve));
        this.client.ready = true;

        return;
        
    }

}

const errtitles0 = [
    "Bad news.",
    "zzz.....",
    "Welp",
    "That red message can't be good.",
    "What??????",
    "One second",
    "Hold!",
    "Halt!",
    "Uh oh"
];