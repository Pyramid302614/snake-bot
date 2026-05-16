const { EmbedBuilder } = require("@discordjs/builders");
const u = require("../../u");
const { MessageFlags } = require("discord.js");

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
    }
}