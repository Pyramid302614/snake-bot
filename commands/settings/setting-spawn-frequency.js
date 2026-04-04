const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ButtonStyle, Emoji } = require("discord.js");
const u = require("../../u");
const { ButtonBuilder } = require("@discordjs/builders");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("setting-spawn-frequency")
        .setDescription("(Admin) Sets the approximate amount of snakes will spawn within 24 hours.")
        .addNumberOption(option => option
            .setName("amount")
            .setDescription("The approximate amount of snakes will spawn within 24 hours")
            .setMinValue(0)
            .setMaxValue(96) // Every 15 minutes
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    contexts: [],

    async execute(interaction) {

        if(!u.sbdb.guildExists(interaction.guildId)) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Wait a minute")
                        .setDescription("You haven't set up your server yet. Click the below button to do so!")
                        .setColor(u.color.rgb("#ffd900"))
                ],
                components: [{type:1,components: [
                    u.msgelem.messageElement(
                        new ButtonBuilder()
                            .setLabel("🚀 Setup")
                            .setStyle(ButtonStyle.Primary),
                        async (del,interaction,data) => {
                            await require("./setup.js").execute(interaction); // Forwards interaction to /setup 
                            del();
                        },
                        [interaction.user.id]
                    ).data
                ]}],
                flags: [MessageFlags.Ephemeral]
            })
            return;
        }
        if(interaction.options.getNumber("amount") / Math.abs(interaction.options.getNumber("amount")) == -1) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Negative numbers aren't allowed!")
                        .setDescription("That would probably break the bot.... idk")
                        .setColor(u.color.rgb("#ff7300"))
                ]
            })
        }
        if(interaction.options.getNumber("amount") % 1 != 0) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Decimals aren't allowed!")
                        .setDescription("Unless you want half of a snake to spawn...")
                        .setColor(u.color.rgb("#ff7300"))
                ],
                flags: [MessageFlags.Ephemeral]
            })
            return;
        }

        const original = u.settings.get(interaction.guild.id,"spawning.frequency");
        await u.settings.set(interaction.guild.id,"spawning.frequency",interaction.options.getNumber("amount"));

        if(u.settings.get(interaction.guild.id,"spawning.frequency") != interaction.options.getNumber("amount")) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(u.errTitles.newTitle("generalPack"))
                        .setDescription("Something happened that caused that to fail. Trying again might not do much, it might?")
                        .setColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(u.errTitles.newTitle("successPack"))
                    .setDescription(`Spawning frequency is now set to ${interaction.options.getNumber("amount")}!\nOriginally, it was set to ${original}`)
                    .setColor(u.color.rgb(u.errTitles.newTitle("successColorPack")))
            ],
            flags: [MessageFlags.Ephemeral]
        });

    }

}