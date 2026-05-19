const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const u = require("../../u");
const { MessageFlags, ContainerBuilder, TextDisplayBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    "1092": async (interaction) => {
        
        if(!u.sbdb.getGuildProperty(interaction.guild.id,"minigame.id")) {
            interaction.update({});
            return;
        }
        const users = u.sbdb.getGuildProperty(interaction.guild.id,"minigame.users") ?? {};
        users[interaction.user.id] = "unknown";
        try {
            await interaction.launchActivity({
                "application_id": u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id
            });
            u.adapter.timeouts.push(setTimeout(() => users[interaction.user.id] = "unfulfilled",15_000));
        } catch(e) {
            console.log(e);
            interaction.update({});
            return;
            var msg = "An error has occurred while trying to open that activity.";
            if(u.adapter.config30.chosen_ones.includes(interaction.user.id)) msg += "\n```"+e.stack+"```";
            switch(e.code) {
                case 50230: msg = "You cannot open activities in your current client."; break;
            }
            await interaction.user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(u.errTitles.newTitle("generalPack"))
                        .setDescription(msg)
                        .setColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }
        u.sbdb.updateGuildProperty(interaction.guild.id,"minigame.users",users);
        
        if(!u.sbdb.getGuildProperty(interaction.guild.id,"DSAMs."+interaction.user.id+".mobileActivityConnectionLatencyWarning")) {
            interaction.followUp({
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
`### Warning!!!!!! ⚠️⚠️🚨🚨🚨
Opening the catch activity **on mobile** is
**fully supported**, but "warming it up" takes
abnormally long. I do not know why this is like this,
but just know **if the screen is black**, give it
a **good 10-20 seconds** to load up.

Luckily, mobile minigames are designed to be **easier**
and **more leniant**, so you don't have to worry
about being behind if you primarily use mobile.`
                                )
                        )
                        .addActionRowComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    u.msgelem.messageElement(
                                        new ButtonBuilder()
                                            .setLabel("Don't show this again please")
                                            .setStyle(ButtonStyle.Secondary),
                                        async (del,b_interaction,d) => {
                                            del();
                                            await b_interaction.update({});
                                            b_interaction.deleteReply("@original");
                                            u.sbdb.updateGuildProperty(interaction.guild.id,"DSAMs."+interaction.user.id+".mobileActivityConnectionLatencyWarning",true);
                                        },
                                        [interaction.user.id]
                                    ).data
                                )
                        )
                        .setAccentColor(u.color.rgb("#ff5100"))
                ],
                flags: [MessageFlags.Ephemeral,MessageFlags.IsComponentsV2]
            });
        }

    },
    "6767": async (interaction) => {
        const channelIDs = u.settings.get(interaction.guild.id,"channels.spawnable");
        if(channelIDs.includes(interaction.channel.id)) {
            return interaction.reply({
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
`### Hmmmmmmm
This channel is already added. Perhaps you pressed this button twice on accident?

-# (Protip: Run \`/settings\` to see what channels you've added)`
                                )
                        )
                        .setAccentColor(u.color.rgb("#ffbb00"))
                ],
                flags: [MessageFlags.Ephemeral,MessageFlags.IsComponentsV2]
            });
        }
        require("../../commands/settings/add-channel.js").execute(interaction); // Forwards to /add-channel
    }
}