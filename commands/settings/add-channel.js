const { ChannelType, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const u = require("../../u");
const { EmbedBuilder } = require("@discordjs/builders");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("add-channel")
        .setDescription("(Admin) Makes this channel snake-spawnable.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    contexts: [],

    async execute(interaction) {

        if(![ChannelType.GuildText].includes(interaction.channel.type)) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Invalid channel type")
                        .setColor(u.color.rgb("#ffee00"))
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }

        if(u.settings.get(interaction.guild.id,"channels.spawnable").includes(interaction.channel.id)) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("You have already added <#"+interaction.channel.id+">!")
                        .setDescription("**Tip**: Do `/remove-channel` to remove channels.")
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
        newChannels?.push(interaction.channel.id);
        await u.settings.set(
            interaction.guild.id,
            "channels.spawnable",
            newChannels
        );


        if(!u.settings.get(interaction.guild.id,"channels.spawnable").includes(interaction.channel.id)) {

            // Error
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(u.errTitles.newTitle("generalPack"))
                        .setDescription("<#"+interaction.channel.id+"> was **failed to save** to the database for some reason. Check `/settings` to see if it's there.\nIf you think this is a mistake, please report this bug in the `/server` or directly reach out to @pyramid302614.")
                        .setColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;

        }

        // Success!!
        var successTitles = u.errTitles.successPack;
        var colors = u.errTitles.successColorPack;        
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(successTitles[Math.floor(Math.random()*successTitles.length)])
                    .setDescription("<#"+interaction.channel.id+"> is now snake spawnable!")
                    .setColor(u.color.rgb(colors[Math.floor(Math.random()*colors.length)]))
            ],
            flags: [MessageFlags.Ephemeral]
        });

    }

}