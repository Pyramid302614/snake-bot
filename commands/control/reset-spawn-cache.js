const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const u = require("../../u");
const { EmbedBuilder } = require("@discordjs/builders");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("reset-spawn-cache")
        .setDescription("(Debug) Resets spawn cache. (Useful for if snakes aren't spawning)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    contexts: [],

    async execute(interaction) {

        await interaction.deferReply();

        await u.sbdb.updateGuildProperty(interaction.guild.id,"spawning",{});

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("✅ Cleared spawning cache.")
                    .setDescription("This would be useful if **snakes weren't spawning**, or if **A snake was stuck in an expired state.**")
            ]
        });

    }
    
}