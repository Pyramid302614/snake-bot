const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("remove-channel")
        .setDescription("(Admin) Makes this channel non-snake-spawnable.")
        .addChannelOption(option => option
            .setName("channel")
            .setDescription("The channel to remove. (Defaults to the one you are in)")
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    contexts: [],

    async execute(interaction) {

        await interaction.deferReply();

        const channel = interaction.options.getChannel("channel") ?? interaction.channel;

        if(!u.sbdb.guildExists(interaction.guild.id)) {
            await u.sbdb.registerGuild(interaction.guild);
        }
        
        if(!u.settings.get(interaction.guild.id,"channels.spawnable").includes(channel.id)) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("<#"+channel.id+"> is not spawnable, so there's nothing to remove!")
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
        newChannels?.splice(newChannels.indexOf(channel.id),1); // Modifies original array
        await u.settings.set(
            interaction.guild.id,
            "channels.spawnable",
            newChannels
        );


        if(u.settings.get(interaction.guild.id,"channels.spawnable").includes(channel.id)) {

            // Error
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(u.errTitles.newTitle("generalPack"))
                        .setDescription("<#"+channel.id+"> was **failed to save** to the database for some reason. Check `/settings` to see if it's no longer there.\nIf you think this is a mistake, please report this bug in the `/server` or directly reach out to @pyramid302614.")
                        .setColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;

        }
      
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("<#"+channel.id+"> is no longer snake spawnable.")
                    .setColor([255,0,0])
            ],
            flags: [MessageFlags.Ephemeral]
        });

    }

}