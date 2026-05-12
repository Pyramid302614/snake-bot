const { EmbedBuilder } = require("@discordjs/builders");

const { Client, MessageFlags, SlashCommandBuilder, REST, Routes, IntentsBitField, Events, PermissionFlagsBits, ActivityType, ContainerBuilder, TextDisplayBuilder } = require("discord.js");

const adapter = require("./adapter.js");

module.exports = {
    client: null,
    async boot(chip) {

        console.log("Chip mode is: " + (chip?"ON":"OFF"));

        const token = (chip)?
            adapter.config30.chipmunk_token:
            adapter.config30.snakelet_token;

        // Creates actual client
        this.client = new Client({
            "intents": [
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.Guilds,
            ]
        });

        // Sets up command listening
        this.client.on("interactionCreate",async (interaction) => {
            if(interaction.isChatInputCommand())
                switch(interaction.commandName) {
                    case "stop":
                        if(adapter.started == true) {
                            try {
                                this.stopReason = interaction.options.getString("reason");
                                await adapter.stopSnakeBot();
                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle("🪦 Stopped.")
                                    ],
                                    flags: [ MessageFlags.Ephemeral ]
                                });
                                require("../idleclient/idle-client.js").client.user.setPresence({
                                    activities: [
                                        { name: "Snake Bot is offline", type: ActivityType.Custom }
                                    ],
                                    status: "dnd" // Do not disturb (Others: "online", "idle", "invisible")
                                });
                            } catch(e) {
                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle("Oh shit")
                                            .setDescription("Snake bot has failed to stop.\n\nError:```"+e+"```")
                                            .setColor([255,0,0])
                                    ],
                                    flags: [ MessageFlags.Ephemeral ]
                                });
                            }
                        } else {
                            interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle("⚠️ Bot already stopped.")
                                ],
                                flags: [ MessageFlags.Ephemeral ]
                            });
                        }
                        break;
                    case "start":
                        if(adapter.started != true) {
                            try {
                                await adapter.startSnakeBot(token);
                                require("../idleclient/idle-client.js").client.user.setPresence({
                                    activities: [],
                                    status: "online" // Do not disturb (Others: "online", "idle", "invisible")
                                });
                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle("✅ Started.")
                                            .setColor([0,255,0])
                                    ],
                                    flags: [ MessageFlags.Ephemeral ]
                                });
                            } catch(e) {
                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle("Oh shit")
                                            .setDescription("Snake bot has failed to start.\n\nError:```"+e+"```")
                                            .setColor([255,0,0])
                                    ],
                                    flags: [ MessageFlags.Ephemeral ]
                                });
                            }
                        } else {
                            interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle("⚠️ Bot already started.")
                                ],
                                flags: [ MessageFlags.Ephemeral ]
                            });
                        }
                        break;
                    case "idk":
                        const split = adapter.config30.ids.status[adapter.chip?0:1].split(":");
                        (await (await (await require("../idleclient/idle-client.js").client.guilds.fetch(split[0])).channels.fetch(split[1])).messages.fetch(split[2])).edit({
                            content: null,
                            components: [
                                new ContainerBuilder()
                                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("# ⚫ Snake Bot is **idk**"))
                                    .setAccentColor([0,0,0])
                            ],
                            flags: [MessageFlags.IsComponentsV2]
                        });
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("✅ Done.")
                                    .setColor([0,255,0])
                            ],
                            flags: [ MessageFlags.Ephemeral ]
                        });
                        break;
                    case "custom":
                        const split1 = adapter.config30.ids.status[adapter.chip?0:1].split(":");
                        (await (await (await require("../idleclient/idle-client.js").client.guilds.fetch(split1[0])).channels.fetch(split1[1])).messages.fetch(split1[2])).edit({
                            content: null,
                            components: [
                                new ContainerBuilder()
                                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(interaction.options.getString("message").replaceAll("\\n","\n")))
                                    .setAccentColor([0,0,0])
                            ],
                            flags: [MessageFlags.IsComponentsV2]
                        });
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("✅ Done.")
                                    .setColor([0,255,0])
                            ],
                            flags: [ MessageFlags.Ephemeral ]
                        });
                        break;
                    default:
                        return;
                }
        });

        const onMsg = (msg) => {

            // Forwards the command part to rlog
            if(["rlog","rattlelog","snake","sanke"].includes(msg.content.split(".")[0]) && msg.content.split(".").length > 1) require("../utilities/log/rlog.js").in(msg)
        
        };
        this.client.on(Events.MessageCreate,onMsg);
        this.client.on(Events.MessageUpdate,(oldMsg,newMsg) => onMsg(newMsg));

        // Logs the client in
        this.client.login(token);

        // Waits for client to be ready
        this.client.ready = false;
        setTimeout(() => {
            if(!this.client.ready) {
                console.log("Client not ready after 10 seconds. Aborting.");
                process.abort();
            }
        },10000);
        await new Promise(resolve => this.client.once("clientReady",resolve));
        this.client.ready = true;

        // Deploys commands
        const rest = new REST({ version: '10' }).setToken(token);

        rest.put(
            Routes.applicationCommands(this.client.user.id),
            { body: [
                new SlashCommandBuilder()
                    .setName("start")
                    .setDescription("Starts the bot.")
                    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
                new SlashCommandBuilder()
                    .setName("stop")
                    .setDescription("Stops the bot.")
                    .addStringOption(option => option.setName("reason").setDescription("Reason for stop.").setRequired(true))
                    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
                new SlashCommandBuilder()
                    .setName("idk")
                    .setDescription("idk")
                    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
                new SlashCommandBuilder()
                    .setName("custom")
                    .setDescription("custom")
                    .addStringOption(option => option.setName("message").setDescription("Message to send"))
                    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            ] }
        );

    }
}