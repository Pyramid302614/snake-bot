const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("remove-channel")
        .setDescription("(Admin) Makes this channel non-snake-spawnable.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    contexts: [],

    async execute(interaction) {

        if(!u.settings.get(interaction.guild.id,"channels.spawnable").includes(interaction.channel.id)) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("<#"+interaction.channel.id+"> is not spawnable, so there's nothing to remove!")
                        .setDescription("This channel is non-snake-spawnable by default unless you add it.")
                        .setColor(u.color.rgb("#c8ff00"))
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }

        let newChannels = u.settings.get(
            interaction.guild.id,
            "channels.spawnable"
        )??[];
        newChannels?.splice(newChannels.indexOf(interaction.channel.id),1); // Modifies original array
        await u.settings.set(
            interaction.guild.id,
            "channels.spawnable",
            newChannels
        );


        if(u.settings.get(interaction.guild.id,"channels.spawnable").includes(interaction.channel.id)) {

            // Error
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(u.errTitles.newTitle("generalPack"))
                        .setDescription("<#"+interaction.channel.id+"> was **failed to save** to the database for some reason. Check `/settings` to see if it's no longer there.\nIf you think this is a mistake, please report this bug in the `/server` or directly reach out to @pyramid302614.")
                        .setColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;

        }
      
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("<#"+interaction.channel.id+"> is no longer snake spawnable.")
                    .setColor([255,0,0])
            ],
            flags: [MessageFlags.Ephemeral]
        });

    }

}