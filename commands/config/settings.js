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

        var each = async (obj,path) => {
            list += "\n" + await u.settings.prettyName(obj) + ": " + await u.settings.prettyValue(obj,u.settings.get(interaction.guild.id,path));
        }
        list.slice(1,);

        var t = async (obj,path) => {
            path = path ?? "";
            for(var i = 0; i < Object.keys(obj).length; i++)  {
                const value = Object.values(obj)[i];
                const key = Object.keys(obj)[i];
                if(typeof value != "object") return;
                if(value.d && value.t && value.s && value.n) await each(value,(path+"."+key).slice(1));
                else await t(value,path+"."+key);
            }
        }
        await t(u.settings.settingsJSON,);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Settings for **" + interaction.guild.name + "**")
                    .setDescription(list)
                    .setFooter({text:"Fun fact: Your guild is stored in sector " + u.sbdb.lookup(interaction.guild.id)})
                    .setColor(u.color.rgb("#00f351"))
            ]
        });     

    }
}