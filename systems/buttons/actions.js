const { EmbedBuilder } = require("@discordjs/builders");
const u = require("../../u");
const { MessageFlags } = require("discord.js");

module.exports = {
    "1092": async (interaction) => {
        const users = u.sbdb.getGuildProperty(interaction.guild.id,"minigame.users") ?? {};
        users[interaction.user.id] = "unknown";
        try {
            await interaction.launchActivity({
                "application_id": u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id
            });
        } catch(e) {
            var msg = "An error has occurred while trying to open that activity.";
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
    }
}