const u = require("../../u");

module.exports = {
    "1092": async (interaction) => {
        const users = u.sbdb.getGuildProperty(interaction.guild.id,"minigame.users") ?? {};
        users[interaction.user.id] = "unknown";
        u.sbdb.updateGuildProperty(interaction.guild.id,"minigame.users",users);
        await interaction.launchActivity({
            "application_id": u.cache.client.user.id
        });
    }
}