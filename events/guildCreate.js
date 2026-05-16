const { Events, Embed, EmbedBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const u = require("../u");

module.exports = {
    data: Events.GuildCreate,
    once: false,
    async execute(guild) {

        try {
            const owner = await guild.fetchOwner();
            await owner.send({
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`
### Thank you for adding Snake Bot to your server, ${owner.displayName}!
To get started, run \`/setup\`, and then you can run \`/add-channels\` in the channels
you would like Snakes to spawn in and/or slither around. (Slithering can be disabled in \`/settings\`)

😖 Got a problem? Message @pyramid302614 or @snakeiguess and we will kindly address it!

ℹ️ Snake Bot is in an **early development stage**, and features are being added frequently, **meaning
things could break at anytime.** If they do, just please patiently wait for a little bit and
we will fix it right up!

🐜 Find bugs or have ideas? Share them in the \`/server\`! 
                                `)
                        )
                        .setAccentColor(u.color.rgb("#snake-bot"))
                ],
                flags: [MessageFlags.IsComponentsV2]
            });
        } catch(ignored) {}
        u.log.log("<@801895100443131976> Somebody has added the bot: " + guild.name);
        if(!u.sbdb.guildExists(guild.id))
            u.sbdb.registerGuild(guild);

    }
}