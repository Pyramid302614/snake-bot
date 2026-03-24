const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { execute } = require("../../events/messageUpdate");
const { traverse, traverseArray, traverseObject } = require("../../utilities/dir");
const u = require("../../u");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription("(Admin) Opens up your server's configurations panel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    contexts: [],
    async execute(interaction) {

        var list = "";

        var each = (obj) => {
            list += u.settings.prettyName(obj) + ": " + u.settings.prettyValue(obj) + "\n";
        }
        var t = (obj) => {
            for(const value of Object.values(obj))
                if(typeof value != "object") return;
                if(value.d && value.t && value.s && value.n) each(value);
                else t(value);
        }
        t(u.settings.settingsJSON);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Settings for **" + interaction.guild.name + "**")
                    .setDescription(list)
                    .setFooter("Fun fact: Your guild is stored in sector " + u.sbdb.lookup(interaction.guild.id))
                    .setColor(u.color.rgb("#00f351"))
            ]
        });     

    }
}