const { Events, Embed, EmbedBuilder } = require("discord.js");
const u = require("../u");

module.exports = {
    data: Events.GuildCreate,
    once: false,
    async execute(guild) {
        
        u.sbdb.registerGuild(guild);

    },
    simulate() {

    }
}