const { EmbedBuilder } = require("@discordjs/builders");
const u = require("../../u");
const { MessageFlags, ContainerBuilder, TextDisplayBuilder } = require("discord.js");

module.exports = {
    "1092": async (interaction) => {
        if(!u.sbdb.getGuildProperty(interaction.guild.id,"minigame.id")) {
            interaction.update({});
            return;
        }
        const users = u.sbdb.getGuildProperty(interaction.guild.id,"minigame.users") ?? {};
        users[interaction.user.id] = "unknown";
        try {
            await interaction.launchActivity({
                "application_id": u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id
            });
        } catch(e) {
            interaction.update({});
            return;
            var msg = "An error has occurred while trying to open that activity.";
            if(u.adapter.config30.chosen_ones.includes(interaction.user.id)) msg += "\n```"+e.stack+"```";
            switch(e.code) {
                case 50230: msg = "You cannot open activities in your current client. (If you are on the website on a mobile device, this is probably the case)"; break;
            }
            await interaction.user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(u.errTitles.newTitle("generalPack"))
                        .setDescription(msg)
                        .setColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }
        u.sbdb.updateGuildProperty(interaction.guild.id,"minigame.users",users);
    },
    "6767": async (interaction) => {
        const channelIDs = u.settings.get(interaction.guild.id,"channels.spawnable");
        if(channelIDs.includes(interaction.channel.id)) {
            return interaction.reply({
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
`### Hmmmmmmm
This channel is already added. Perhaps you pressed this button twice on accident?

-# (Protip: Run \`/settings\` to see what channels you've added)`
                                )
                        )
                        .setAccentColor(u.color.rgb("#ffbb00"))
                ],
                flags: [MessageFlags.Ephemeral,MessageFlags.IsComponentsV2]
            });
        }
        require("../../commands/settings/add-channel.js").execute(interaction); // Forwards to /add-channel
    }
}