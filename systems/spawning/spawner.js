// Universal check rate: 1 minute

const { ButtonBuilder } = require("discord.js");
const u = require("../../u");

module.exports = {

    configure() {

        var i = setInterval(() => {

            // Calls checkFrames asynchronously
            u.sbdb.getAllIDs();
            for(const id of ids) checkFrame(id); // Holy efficiency :fire: you don't even have to read any of the guild data (until you get in checkFrame() ofc)
            
        },1/**60*/*1000); // 1 minute

    }

}

async function startSpawn(guildId) {

    const guildObj = u.cache.client.guilds.fetch(guildId);

    if(!(u.settings.get(guildId,"spawning.enabled")??false)) return "Spawning disabled";

    var channel = await selectLocation(guildObj);
    if(!channel) return "Channel failed";

    const emergingMsg = await channel.send("A snake is emerging...");

    await new Promise(resolve => setTimeout(resolve,3000));

    emergingMsg.delete();

    const type = require("./types.js").randomType();
    if(!type) return "Type failed";

    const spawnMsg = await channel.send({
        content: `A ${type.name} snake has emerged!`,
        comonents: [
            {
                type: 1,
                components: [
                    u.msgelem.messageElement(
                        new ButtonBuilder()
                            .setLabel("Catch me")
                            .setType(ButtonType.Primary),
                        (del,interaction,data) => {

                            // Updates count asynchronously
                            let count = 1; // 1 snake
                            let path = `inventories.${interaction.user.id}.snakes.${type.name}`;
                            const currentAmount = (u.sbdb.getGuildProperty(
                                guildId,
                                path
                            ) ?? 0);
                            u.sbdb.updateGuildProperty(
                                guildId,
                                path,
                                currentAmount + amount
                            );

                            // Shows that you caught it
                            interaction.message.update({
                                content: `You have caught ${type.name} snake! (New amount: ${currentAmount+amount})`, // An assumption on the new value
                                components: []
                            });

                            // Deletes button from msgelem cache
                            del();

                        }
                    )
                ] 
            }
        ]
    });
    // I coded this in school
    
}

// Checks and sets timers
async function checkFrame(guildId) {

    try {
        const now = Date.now(); // Pre-calculates
        const currentFrame = u.sbdb.getGuildProperty(guildId,"spawning.frame");
        if(!currentFrame?.end /*I did .end just incase currentFrame is {}*/ || now >= currentFrame.end) u.sbdb.updateGuildProperty(guildId,"spawning.frame",newFrame(guildId));
        else
            if(currentFrame.executed.length >= currentFrame.timeline.length) return; // Waiting for the above thing to trigger
            else {
                for(var i = currentFrame.timeline.length-1; i >= 0; i--) {
                    if(now >= currentFrame.timeline[i] && !currentFrame.executed.includes(i)) {
                        currentFrame.executed.push(i);
                        await startSpawn(guildId); // Higher priority
                        await u.sbdb.updateGuildProperty(guildId,"spawning.frame",currentFrame);
                        return;
                    }
                }
            }
    } catch(ignored) {}

}

function newFrame(guildId) {

    var frequency = u.settings.get(guildId,"spawning.frequency");
    frequency = frequency - 1 + Math.floor(Math.random()*3); // Either subtracts 1, does nothing, or adds 1
    frequency = Math.min(72,frequency); // Maxes out at 3 per hour silently (Please dont break my vps)

    const now = Date.now();
    const duration = 24/**60*60*/*1000; // Pre-calculates 24 hours
    const min_distance = 0.75; // Shortens deviation by 25% (x0.75) (Distance as in distance from other points)
    const max_deviation = Math.floor(duration/frequency)*min_distance;

    // CodeHS project representation:
    // https://codehs.com/sandbox/greencamel7231/1d-linear-map-skewer/run (Ctrl+Click on VSCode)
    
    // Generates 1 dimensional map with altered times to be more organic/random
    const points = [];
    for(var i = 0; i < frequency; i++) {

        let linear = Math.floor(now + (now + duration) * (i / frequency));
        let nonlinear = Math.min(Math.max(now,linear - max_deviation + Math.floor(Math.random()*(max_deviation+1))),now+duration);

        points.push(nonlinear);

    }

    return {
        end: now+duration, // Exclusive
        timeline: points,
        executed: []
    };

}

// Returns false if no channels
async function selectLocation(guildObj) {

    try {
        var channels = u.settings.get(guildObj.id,"channels.spawnable");
        if(channels.length == 0) return false; // If no channels added
        if(channels.length == 1) return channels[0]; // If only one channel added

        var seed = Math.random();

        for(var i = Math.floor(seed*channels.length); i < channels.length; i++) {

            if(i >= channels.length) i = 0;

            const channel = await guildObj.channels.fetch(channels[i]);

            const messages = channel.messages.fetch({limit:10});
            if(messages[messages.length-5].createdTimestamp+10*60*1000>Date.now()) // 4th to last message must be at most 10 minutes old
            return channel;

        }
    } catch(ignored) {}


}