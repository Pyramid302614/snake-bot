const { EmbedBuilder, TextInputBuilder, ButtonBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, TextInputStyle, ButtonStyle } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("(Utility) Opens the shop where you can buy upgrades and perks :)"),
    
    contexts: [],

    async execute(interaction) {

        await interaction.reply(gen(interaction,0));

    }

}

function gen(interaction,selected) {

    const bal = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.socialCredit`) ?? 0;
    const catalog = require("../../systems/shop/shop.js").getAllItems();

    return {
        embeds: [
            new EmbedBuilder()
                .setTitle("Welcome to the shop")
                .setDescription("Here you can buy things with **Social Credit** for perks and upgrades!\n\nYou have **" + bal + "** Social Credit."+((bal==0)?"(Protip: Catch snakes to get social credit)":""))
                .setColor(u.color.rgb("#7000f0"))
        ],
        components: [
            {
                type: 1,
                components: u.msgelem.messageElement(
                    new TextInputBuilder()
                        .setPlaceholder(selected == 0 ? "Enter product # from the catalog here..." : catalog[selected].pretty ?? selected)
                        .setMinLength(1)
                        .setMaxLength(3)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short),
                    async (del,interaction,data) => {
                        console.log(interaction);
                        await interaction.update(gen(interaction,interaction.value));
                        del();
                    },
                    [interaction.user.id]
                ).data
            },
            {
                type: 1,
                components: u.msgelem.messageElement(
                    new ButtonBuilder()
                        .setLabel(selected == 0 ? "Nothing selected" : catalog[selected].cost > bal ? `Need ${bal-catalog[selected].cost - bal} more social credit` : "Purchase")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(selected == 0 || catalog[selected].cost > bal),
                    async (del,interaction,data) => {
                        await interaction.update(gen(interaction,selected));
                        del();
                    },
                    [interaction.user.id]
                ).data
            }
        ]
    };
}