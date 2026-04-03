const u = require("../../u");
const location = require("./location");
const messages = require("./messages");

module.exports = {

    configure() {return;

        u.adapter.intervals_or_timeouts.push(
            setTimeout(() => {

                const ids = u.sbdb.getAllIDs();
                for(const id of ids) checkGuild(id); // Asynchornously callsS

            },1000) // Every second
        );

    }

}

async function checkGuild(id) {

    try {
        
        const spawnData = u.sbdb.getGuildProperty(id,"spawning");
        if(!spawnData) await u.sbdb.updateGuildProperty(id,"spawning",newSpawnData(id,false));

        const guildObj = await u.cache.client.guilds.fetch(id);
        const now = Date.now();

        if(spawnData.step == 0) {

            if(now > spawnData.next) {

                // Generate message
                spawnData.msgId = (await guildObj.channels.fetch(spawnData.path[0])).send(messages.emerge(u.sbdb.guildSync(id))).id;
                
                spawnData.step = 1;
                
                // Re-sync
                await u.sbdb.updateGuildProperty(id,"spawning",spawnData);
                
                return {data:"Emerged",code:0};

            }

            return {data:"Waiting to emerge",code:0};
            
        } else if(spawnData.step > 0) {

            if(now >= spawnData.next) {

                // Delete message
                if(spawnData.msgId) (await guildObj.channels.fetch(spawnData.path[spawnData.path[spawnData.step-1]])).messages.fetch(spawnData.msgId); 

                spawnData.step++;

                if(!spawnData.path?.[spawnData.step-1]) { // Step will always be 1 higher than the index
                    if(spawnData.path.length == 1) spawnData = newSpawnData(id,false);
                    else spawnData = newSpawnData(id,true,spawnData);
                    await u.sbdb.updateGuildProperty(id,"spawning",spawnData);
                    return {data:"Despawned and regenerated spawn data",code:0};
                }
                
                // Regenerate message
                spawnData.msgId = (await guildObj.channels.fetch(spawnData.path[0])).send(messages.emerge(u.sbdb.guildSync(id))).id;
                spawnData.next = now+Math.floor(u.time.hours(24)/u.settings.get(id,"spawning.frequency")*(Math.random()*0.50+0.75));

                // Re-sync
                await u.sbdb.updateGuildProperty(id,"spawning",spawnData);

                return {data:"Slithered",code:0};

            }

            return {data:"Waiting to slither",code:0};

        } else if(spawnData.step == -1) {

            spawnData = newSpawnData(id,false);
            spawnData.next = now+Math.floor(u.time.hours(24)/u.settings.get(id,"spawning.frequency")*(Math.random()*0.50+0.75));

            u.sbdb.updateGuildProperty(id,"spawning",spawnData);
            return {data:"Caught and regenerated spawn data",code:0};

        }            

    } catch(e) {
        return {data:e,code:-2};
    }

}

function newSpawnData(id,keepPath,original) {

    const now = Date.now();

    return {
        path: keepPath?original.path:location.newPath(id,now),
        instance: {
            msgId: null,
            timestamp: now,
            next: null,
            step: 0 // -2: despawned -1: caught - 0: needs emerge - 1: emerged - 2+: slithers
        }
    };

}