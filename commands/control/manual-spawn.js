const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ContainerBuilder, TextDisplayBuilder, ActionRow, ButtonStyle } = require("discord.js");
const u = require("../../u.js");
const { ActionRowBuilder } = require("@discordjs/builders");
const { ButtonBuilder } = require("@discordjs/builders");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("manual-spawn")
        .setDescription("(Mod) Manually spawns a snake.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    contexts: [],

    async execute(interaction) {

        if((u.settings.get(interaction.guild.id,"channels.spawnable")??[]).length == 0) {
            return interaction.reply({
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
`### Uh oh!
You don't have any spawnable channels yet.
Run \`/add-channel\` to fix that :)
To see your added channels, run \`/settings\``
                                )
                        )
                        .addActionRowComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel("Add this channel")
                                        .setStyle(ButtonStyle.Primary)
                                        .setCustomId("action:6767")
                                )
                        )
                        .setAccentColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral,MessageFlags.IsComponentsV2]
            })
        } 

        await interaction.deferReply();

        const now =  Date.now();
        var path = await require("../../systems/spawning/location.js").newPath(interaction.guild,now);
        if(path.code == 1) path = []; else if(path.code) path = path.data;

        const response = await require("../../systems/spawning/spawner.js").checkGuild(interaction.guild.id,{
            path: path, // makes random path
            next:now-1000, // next spawn is 1 second ago, forcing it to start emerging
            timestamp: now, // pointless attribute
            step: 0, // 0 = waiting to emerge
            msgId: null // Set later
        });
        const ok = response.code >= 0;

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(ok?"✅ Started spawn":"❌ Failed to spawn")
                    .setDescription(!ok?`Response: \`\`\`${response.data}\`\`\``:null)
                    .setColor(ok?[0,255,0]:[255,0,0])
            ],
            flags: [MessageFlags.Ephemeral] // 🤫
        });

    }

}