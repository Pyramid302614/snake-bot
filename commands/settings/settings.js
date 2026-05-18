const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, TextInputBuilder, ContainerBuilder, TextDisplayBuilder, ActionRow, ActionRowBuilder, LabelBuilder, SectionBuilder, ModalBuilder, TextInputStyle } = require("discord.js");
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

        await interaction.reply(await settingsUI(interaction,{}));

    }
}

async function settingsUI(interaction,data) {

    const components = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
`### Settings for **${interaction.guild.name}**`
            )
        )
        .setAccentColor(u.color.rgb("#00f351"));

        
    const dels = [];

    var each = async (obj,path) => {

        const value = u.settings.get(interaction.guild.id,path);
        const prettyValue = await u.settings.prettyValue(obj,value);

        const button = u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel(
                    obj.t == "boolean"
                        ?(
                            value === true
                                ?"Yes"
                                :"No"
                        )
                        :(
                            "Edit"
                        )
                )
                .setStyle(
                    obj.t == "boolean"
                        ?(
                            value === true 
                                ?ButtonStyle.Success
                                :ButtonStyle.Danger
                        )
                        :(
                            ButtonStyle.Primary
                        )
                ),
            async (del,b_interaction,d) => {

                if(obj.mc !== true) {

                    await b_interaction.reply({
                        components: [
                            new ContainerBuilder()
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(obj.mc)
                                )
                                .setAccentColor(u.color.rgb("#ffbb00"))
                        ],
                        flags: [MessageFlags.Ephemeral,MessageFlags.IsComponentsV2]
                    });

                } else if(obj.t == "boolean") {

                    for(const Del of dels) Del();

                    await u.settings.set(interaction.guild.id,path,!value);
                    b_interaction.update(await settingsUI(interaction,data));

                } else {
                    
                    const input = new TextInputBuilder()
                        .setPlaceholder("Enter value here... (e.g., beans, 30, @brotaterade)")
                        .setRequired(true)
                        .setStyle(obj.t == "string-long"?TextInputStyle.Paragraph:TextInputStyle.Short)
                        .setCustomId("inputBox");
                        
                    const modal = u.msgelem.messageElement(
                        new ModalBuilder()
                            .setTitle(obj.n)
                            .addLabelComponents(
                                new LabelBuilder()
                                .setDescription("beans")
                                    .setLabel("Changing: " + obj.n)
                                    .setDescription(obj.de)
                                    .setTextInputComponent(input)
                            ),
                        async (del,t_interaction,d) => {

                            del();

                            const result = t_interaction.fields.getTextInputValue("inputBox");
                            const parsed = u.settings.parsePrettyValue(result,obj.t);

                            if(parsed.success === false) {
                                t_interaction.reply({
                                    components: [
                                        new ContainerBuilder()
                                            .addTextDisplayComponents(
                                                new TextDisplayBuilder()
                                                    .setContent(
                                                        "### Uh oh!\n"+parsed.message
                                                    )
                                            )
                                            .setAccentColor(u.color.rgb("#ffae00"))
                                    ],
                                    flags: [MessageFlags.Ephemeral,MessageFlags.IsComponentsV2]
                                });
                            } else {

                                for(const Del of dels) Del();
                                await u.settings.set(interaction.guild.id,path,parsed.message);
                                await t_interaction.update({});
                                await interaction.editReply(await settingsUI(interaction,data));

                            }

                        },
                        [b_interaction.user.id]
                    );

                    await b_interaction.showModal(modal.data);

                }

            },
            [interaction.user.id]
        );

        dels.push(button.del);

        components.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent("**" + obj.n + "**: " + prettyValue + "\n-# " + obj.de)
                )
                .setButtonAccessory(
                    button.data
                )
        );

    }

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
    await t(u.settings.settingsJSON);



    components.addTextDisplayComponents(
        new TextDisplayBuilder()
            .setContent(
`-# Fun fact: Your server is stored in sector ${u.sbdb.lookup(interaction.guild.id)}`
            )
    );

    return {
        components: [components],
        flags: [MessageFlags.Ephemeral,MessageFlags.IsComponentsV2]
    }

}