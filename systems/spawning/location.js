const u = require("../../u")

const selectMessage = 8; // 8th to last message gets used
const messageAge = u.time.minutes(20); // Must be at least 20 minutes of age to be considered inactive

module.exports = {

    newPath(guildObj,now) {

        const guildId = guildObj; // Makes things easier

        const slitheringEnabled = u.settings.get(guildId,"spawning.slithering.enabled");
        
        const channels = u.settings.get(guildId,"spawning.channels");
        if(!channels) return {
            data: "No channels selected",
            code: 0 // Its still ok
        };

        const slitheringAmount = u.settings.get(guildId,"spawning.slithering.amount");

        const path = [];

        const direction = Math.floor(Math.random()*2) == 0;
        for(var i = direction?0:(channels.length-1); direction?(i < channels.length):(i >= 0); direction?(i++):(i--)) {
            
            if(path.length >= 1+slitheringAmount) break; // 1 = emerge message, slitheringAmount = slither messages

            const channel = channels[i];
            const channelObj = guildObj.channels.fetch(channel);
            let messages = channelObj.messages.fetch()
            if(now > messages[messages.length-1-selectMessage].createdTimestamp+messageAge)
                path.push(channel);

        }

        if(path.length == 0) path.push(channels[Math.floor(Math.random()*channels.length)]); // Selects random channels if none are usable

        return path;
        
    }

}