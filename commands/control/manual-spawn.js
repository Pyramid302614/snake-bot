const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("manual-spawn")
        .setDescription("(Mod) Manually spawns a snake.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    contexts: [],

    async execute(interaction) {

        await interaction.deferReply();

        const response = await require("../../systems/spawning/spawner.js").startSpawn(interaction.guild.id);
        const ok = response.code == 0; // As of new spawning systems

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(ok?"✅ Started spawn":"❌ Failed to spawn")
                    .setDescription(!ok?`Response: \`\`\`${response}\`\`\``:null)
                    .setColor(ok?[0,255,0]:[255,0,0])
            ],
            flags: [MessageFlags.Ephemeral] // 🤫
        });

    }

}