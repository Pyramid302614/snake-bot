const { Collection } = require("discord.js");
const u = require("../../u")

const selectMessage = 8; // 8th to last message gets used
const messageAge = u.time.minutes(20); // Must be at least 20 minutes of age to be considered inactive

module.exports = {

    async newPath(guildObj,now) {

        const guildId = guildObj.id; // Makes things easier

        const slitheringEnabled = u.settings.get(guildId,"spawning.slithering.enabled");
        
        const channels = u.settings.get(guildId,"channels.spawnable");
        if(!channels || channels.length == 0) return {
            data: "No channels selected",
            code: 1
        };

        const slitheringAmount = u.settings.get(guildId,"spawning.slithering.amount");

        const path = [];

        const direction = Math.floor(Math.random()*2) == 0;
        for(var i = direction?0:(channels.length-1); direction?(i < channels.length):(i >= 0); direction?(i++):(i--)) {
            
            //         slithering disabled check                  slithering enabled check
            if((!slitheringEnabled && path.length == 1) || (path.length >= 1+slitheringAmount)) break; // 1 = emerge message, slitheringAmount = slither messages

            const channel = channels[i];
            const channelObj = await guildObj.channels.fetch(channel);
            let messages = Array.from(await channelObj.messages.fetch());
            if(now > messages[messages.length-1-selectMessage][1].createdTimestamp+messageAge)
                path.push(channel);

        }

        if(path.length == 0) path.push(channels[Math.floor(Math.random()*channels.length)]); // Selects random channels if none are usable

        return path;
        
    }

}