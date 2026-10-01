const { SlashCommandBuilder, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder } = require("discord.js");
const u = require("../../u");

const maxPerPage = 5;

module.exports = {

    data: new SlashCommandBuilder()
        .setName("announcements")
        .setDescription("Gets you all the latest announcements"),

    contexts: ["absent"],

    async execute(interaction) {

        interaction.reply(await list(interaction,{page:0}));

    }

}

// Returns message object of list page
async function list(interaction,data) {

    const dels = [];

    const button_refresh = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("Refresh")
            .setStyle(ButtonStyle.Secondary),
        async (del,b_interaction,d) => {
            b_interaction.update(await list(interaction,data));
        },
        [interaction.user.id]
    );

    dels.push(button_refresh.del);

    const container = new ContainerBuilder()
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            "Announcements"
                        )
                )
                .setButtonAccessory(
                    button_refresh.data
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
        )
        // Add components on a loop
        .setAccentColor(
            u.color.rgb("#snake-bot")
        );

    const view = [];
    let all = require("../../systems/announcements/announcements.js").getAll();
    for(var i = maxPerPage * data.page; i < maxPerPage; i++) {
        if(all?.[i] !== undefined) view.push(all[i]);
    }

    for(var i = 0; i < view.length; i++) {

        const a = view[i];
        const ago = Date.now() - a.timestamp;
        const discTimestamp = Math.floor(a.timestamp/1000); // No MS
        var agoText = ago < u.time.minutes(1) ? "Just now" : (ago < u.time.hours(5) ? `<t:${discTimestamp}:R>` : (ago < u.time.days(7) ? `<t:${discTimestamp}:f>` : `<t:${discTimestamp}:D>`));

        container
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`### ${a.title}\n-# ${agoText}`)
                    )
                    .setButtonAccessory((() => {
                        const button = u.msgelem.messageElement(
                            new ButtonBuilder()
                                .setLabel("Open")
                                .setStyle(ButtonStyle.Primary),
                            async (del,b_interaction,d) => {
                                for(const Del of dels) Del();
                                b_interaction.update(await open(interaction,a,data.page));
                            },
                            [interaction.user.id]
                        );
                        dels.push(button.del);
                        return button.data;
                    })())
            );
        if(i != Object.keys(view).length-1) {
            container
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(
                        SeparatorSpacingSize.Small
                    )
            );
        }

    }

    if(view.length == 0) {
        
        container
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        "\n-# There's nothing here...\n"
                    )
            );

    } else if(all.length > maxPerPage) {

        const button_back = u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel(" < ")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(data.page == 0),
            async (del,b_interaction,d) => {
                for(const Del of dels) Del();
                data.page++;
                b_interaction.update(await list(interaction,data));
            },
            [interaction.user.id]
        );
        const button_next = u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel(" > ")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled((data.page+1) * maxPerPage >= all.length),
            async (del,b_interaction,d) => {
                for(const Del of dels) Del();
                data.page--;
                b_interaction.update(await list(interaction,data));
            },
            [interaction.user.id]
        );

        dels.push(button_back.del);
        dels.push(button_next.del);

        container
            .addSeparatorComponents(
                new SeparatorBuilder()
            )
            .addActionRowComponents(
                new ActionRowBuilder()
                    .setComponents(
                        button_back.data,
                        button_next.data
                    )
            )

    }

    return {
        components: [
            container
        ],
        flags: [
            MessageFlags.Ephemeral,
            MessageFlags.IsComponentsV2
        ]
    };

}

// Returns message object of message
// announcement: announcement OBJECT, not the title
async function open(interaction,announcement,fromPage) {

    const dels = [];

    const button_back = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("< Back")
            .setStyle(ButtonStyle.Secondary),
        async (del,b_interaction,d) => {
            for(const Del of dels) Del();
            b_interaction.update(await list(interaction,{page:fromPage}));
        },
        [interaction.user.id]
    );

    dels.push(button_back.del);

    return {
        components: [
            new ContainerBuilder()
                .addActionRowComponents(
                    new ActionRowBuilder()
                        .setComponents(
                            button_back.data           
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `### ${announcement.title}\n${announcement.content}`
                        )
                )
                .setAccentColor(
                    u.color.rgb("#snake-bot")
                )
        ],
        flags: [
            MessageFlags.Ephemeral,
            MessageFlags.IsComponentsV2
        ]
    };
    
}