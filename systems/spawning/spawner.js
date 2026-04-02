const u = require("../../u");
const timing = require("./timing.js");
const location = require("./location.js");
const messages = require("./messages.js");

module.exports = {

    configure() {

        u.adapter.intervals_or_timeouts.push(
            
            // Frame checking timeout
            setTimeout(() => {

                const ids = u.sbdb.getAllIDs();
                for(const id of ids) checkFrame(id); // Asynchronously calls

            }, 10_000) // 10 seconds

        )

    },

    startSpawn(guildId) {

        

    }

}

async function checkFrame(guildId) {

    try {
        
        const frame = u.sbdb.getGuildProperty(guildId,"spawning.frame");
        const now = Date.now();

        // If frame isn't generated yet for any reason
        if(!frame || now > frame.end) {
            await u.sbdb.updateGuildProperty(guildId,"spawning.frame",timing.newFrame(guildId));
            return {
                data: "Generated new frame.",
                code: 0
            };
        }
        
        for(let i = 0; i < (frame.timeline ?? []).length; i++) {

            // If time hasn't been executed yet and if it should be executed
            if(!frame.executed.includes(i) && now >= frame.timeline[i]) {

                frame.executed.push(i);
                
                u.sbdb.updateGuildProperty(guildId,"spawning.frame",frame); // Re-syncs to storage
                return {
                    data: "Executed timeline point.",
                    code: 0
                }

            }

        }

        return {
            data: "Nothing to execute.",
            code: 0
        };

    } catch(e) {

        return {
            data: e,
            code: -2
        };

    }

}

async function startSpawn(guildId) {

    try {

        // Gets guild data
        const guild = u.sbdb.guildSync(guildId);
        if(!guild) return {
            data: "Nonexistant guild.",
            code: -1
        };

        // Checks
        if(!guild?.settings?.spawning?.enabled) return {
            data: "Spawning is not enabled.",
            code: -1
        };
        if(!guild?.spawning?.status == "ready") return {
            data: "Spawning is not marked as \"ready\"",
            code: -1
        }


        // Gets random type
        const type = u.snakes.types.randomType();
        if(!type) return {
            data: "Failed to get random type.",
            code: -1
        };

        // Fetches guild
        const guildObj = await u.cache.client.guilds.fetch(guildId);
        if(!guildObj) return {
            data: "Failed to fetch guild.",
            code: -1
        };
        const channelIds = location.selectChannels(guildId);
        

        // Gets emerge message
        const msg = messages.emerge(guild,type);
        if(msg.code != 0) return {
            data: "Failed to get emerge message.",
            code: -1
        };
        
    } catch(e) {
        return {
            data: e,
            code: -2
        };
    }

}