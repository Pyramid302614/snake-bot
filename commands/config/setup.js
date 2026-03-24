const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ButtonStyle, ChannelType } = require("discord.js");
const u = require("../../u");
const { EmbedBuilder } = require("@discordjs/builders");
const { ButtonBuilder } = require("@discordjs/builders");
const { ChannelSelectMenuBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("(Admin) Sets up Snake Bot just for you :o")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    contexts: [],
    async execute(interaction) {

        if(u.settings.get(interaction.guild.id,"configured")) {

            require("./settings.js").execute(interaction); // Forwards it to settings
            return;

        }

        // If not configured ===========================
            
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Thank you for adding Snake Bot!!")
                    .setDescription("Please wait while I set up your guild :)")
                    .setColor(u.color.rgb("#009a33"))
            ]
        });
        
        // Asynchronously calls the register function if it's not already registered (Runs in the background)
        if(!u.sbdb.guildExists(interaction.guild.id)) {
            u.sbdb.registerGuild(interaction.guild);
        }

        await new Promise(resolve => setTimeout(resolve,1000));

        var msg = {
            embeds: [
                new EmbedBuilder()
                    .setTitle("Settings things up...")
                    .setDescription("While you wait, consider joining the Snake Bot community! `/server`")
                    .setColor(u.color.rgb("#009a33"))
            ]
        };
        
        // yes! the loading "animation" thing means absolutely nothing.
        // it's design; setting up actually takes less than 1/1000th of a second to do, but the human brain
        // says otherwise, big things = more time, because more time = more effort
        // therefore, if I have it be more than 1 ms and add some shiny colors and humurous messages, it comes
        // off as "damn, this things legit" thus improving it's first impressions, which as
        // you may have heard, are the best impressions.
        var messages = ["Settings things up...","Adding guild to the Snake Bot Database...","Configuring settings...","Calling snakes over...","Configuring random crap...","Painting snakes green...","Nuking AI database...","Pissing off angry snake...","Finishing things up....","Finishing things up...."];
        var colors = ["#009a33","#ffee00","#00fffb","#ff4400","#ff00d9"]; // Jumps between left and right on the hue slider
        var done = false;
        var i = 0; // Color
        var m = 0; // Message
        while(!done) {
            if(m == messages.length) break;
            await new Promise(resolve => setTimeout(resolve,500));
            msg.embeds[0].setColor(u.color.rgb(colors[i % (colors.length-1)]))
            msg.embeds[0].setTitle(messages[m]);
            await interaction.editReply(msg);
            i++;
            if(Math.random()>0.55) m++;
        }

        await new Promise(resolve => setTimeout(resolve,1000));


        const confirmButton = 
            u.msgelem.messageElement(
                new ButtonBuilder()
                    .setLabel("Confirm Choices")
                    .setStyle(ButtonStyle.Primary),
                () => {},
                [interaction.user.id]
            );


        var selectedChannels = [];
        var selectDel = () => {};
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("What channels should I use? (You can edit this later if needed)")
                    .setDescription("Snakes will be able to spawn in any channel you select.\n**Note: You must give Snake Bot access to channels in order for snakes to spawn there.**")
                    .setColor(u.color.rgb("#ffbb00"))
            ],
            components: [
                {
                    type: 1,
                    components: [
                        u.msgelem.messageElement(
                            new ChannelSelectMenuBuilder()
                                .setPlaceholder("Select here")
                                .setCustomId(interaction.user.id+":./commands/config/setup.js:snake_spawn_channels_selection_menu")
                                .setMinValues(0).setMaxValues(25)
                                .setChannelTypes(ChannelType.GuildText,ChannelType.GuildAnnouncement),
                            (del,interaction,data) => {
                                selectDel = del;
                                interaction.update({});
                                selectedChannels = interaction.values;
                            },
                            [interaction.user.id]
                        ).data
                    ]
                },
                {
                    type: 1,
                    components: [
                        confirmButton.data
                    ]
                }
            ]
        });

        await new Promise(resolve => {
            confirmButton.execute = (del,interaction,data) => {
                interaction.update({});
                del();
                resolve();
            }
        });

        selectDel();
        
        await u.settings.set(interaction.guild.id,"channels.spawnable",selectedChannels);
        await u.settings.set(interaction.guild.id,"channels.configured",true);

        const currentSettings = u.settings.get(interaction.guild.id,"channels.spawnable");
        if(!selectedChannels.every((val,i) => val == currentSettings?.[i])) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Well that was weird.")
                        .setDescription("It seems your guild settings didn't save. Maybe try again?\nIf that doesn't work, either report the bug in `/server` or directly reach out to @pyramid302614.")
                        .setColor([255,0,0])
                ],
                components: []
            });
        } else {

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("You're all set!")
                        .setDescription("Enjoy Snake Bot!!")
                        .setColor(u.color.rgb("#ea00ff"))
                ],
                components: []
            });

        }
        
        

    }
}