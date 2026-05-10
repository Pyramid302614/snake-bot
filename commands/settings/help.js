const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Opens up that classic /help menu")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    contexts: [],

    async execute(interaction) {

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: u.cache.client.user.displayName,
                        iconURL: await u.cache.client.user.avatarURL()
                    })
                    .setTitle("Get started with `/setup`")
                    .setDescription("For tutorials on what you can do with Snake Bot, feel free to join the `/server`, where there is a full channel just for tutorials.\nTo configure your guild, use `/setup`.")
                    .setColor(u.color.rgb("#snake-bot"))
            ],
            flags: [
                MessageFlags.Ephemeral
            ]
        });

    }

}