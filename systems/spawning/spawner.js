const u = require("../../u");
const timing = require("./timing.js");

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
        
        // If frame isn't generated yet for any reason
        if(!frame) {
            await u.sbdb.updateGuildProperty(guildId,"spawning.frame",timing.newFrame(guildId));
            return {
                data: "Generated new frame.",
                code: 0
            };
        }
        
        for(let i = 0; i < (frame.timeline ?? []).length; i++) {

            // If time hasn't been executed yet
            if(!frame.executed || !(frame.executed??[]).includes(i)) {

                // TODO THIS

            }

        }

    } catch(e) {

        return {
            data: e,
            code: -2
        };

    }

}