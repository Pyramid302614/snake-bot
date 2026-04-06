const u = require("../../u");
const location = require("./location");
const messages = require("./messages");

module.exports = {

    configure() {

        u.adapter.intervals.push(
            setInterval(() => {

                const ids = u.sbdb.getAllIDs();
                for(const id of ids) checkGuild(id); // Asynchornously callsS

            },10000) // Every 10 seconds
        );

    },

    checkGuild: checkGuild

}

async function checkGuild(id,overrideSpawnData) {

    try {

        if(!u.sbdb.guildExists(id)) return {data:"Nonexistant guild.",code:-1};
        
        const now = Date.now();

        // Fetches and/or regenerates spawn data if necessary
        var spawnData = overrideSpawnData ?? u.sbdb.getGuildProperty(id,"spawning");
        if(now % 5000 < 2000) { // Every 3-5 seconds (Safely)
            const channels = u.settings.get(id,"channels.spawnable");
            if(!channels || channels.length == 0) return {data:"No channels selected",code:1}; // Checks if path size has changed
            else if(!spawnData.path || spawnData.path?.length == 0) spawnData.step = undefined; // Forces it to regenerate below
        }
        if(spawnData.step == undefined || spawnData.step == null) {
            // Step will always be in a healthy spawn data, so I used this for diagnostic
            spawnData = await newSpawnData(id,false);
            spawnData.next = newNext(id,now,true);
        }

        if(spawnData.path.length == 0) return {data:"No channels selected",code:1};


        // Fetches guild object
        const guildObj = await u.cache.client.guilds.fetch(id);
        if(!guildObj) return {data:"Guild does not exist within discord",code:-1};

        var returnObject = {data:"No return object",code:1};

        if(spawnData.step == 0) { // Needs to emerge (Sitting idle)
            if(now >= spawnData.next) {

                // Generate message 
                const emergeMessage = messages.emerge(u.sbdb.guildSync(id),u.snakes.types.randomType(),id);
                if(emergeMessage.code == 0)
                    console.log(emergeMessage.data);
                    // spawnData.msgId = (await (await guildObj.channels.fetch(spawnData.path[0])).send(emergeMessage.data)).id;
                else
                    return {data:"Failed to get random type",code:-1};
                
                spawnData.step = 1;
                spawnData.next = await newNext(id,now,true);

                returnObject = {data:"Emerged",code:0};

            } else returnObject =  {data:"Waiting to emerge",code:0};
            
        } else if(spawnData.step > 0) { // Is emerged, but waiting for catch/slither

            if(now >= spawnData.next) {

                spawnData.step++;

                // Deletes old message
                if(spawnData.msgId) {
                    const channel = (await guildObj.channels.fetch(spawnData.path[spawnData.step-2]));
                    if(channel) (await channel.messages.fetch(spawnData.msgId)).delete();
                    spawnData.msgId = null;
                }

                // Checks if it needs to despawn
                if(!spawnData.path?.[spawnData.step-1]) { // Step will always be 1 higher than the index
                    if(spawnData.path.length == 1) spawnData = await newSpawnData(id,false);
                    else spawnData = await newSpawnData(id,true,spawnData);
                    spawnData.next = newNext(id,now);
                    returnObject = {data:"Despawned and regenerated spawn data",code:0};
                } else {
                    
                    // Regenerate message
                    const slitherMessage = messages.slither(u.sbdb.guildSync(id),u.snakes.types.randomType());
                    if(slitherMessage.code == 0) {
                        const channel = (await guildObj.channels.fetch(spawnData.path[spawnData.step-1]));
                        if(channel) spawnData.msgId = (await channel.send(slitherMessage.data)).id;
                    } else
                        return {data:"Failed to get random type",code:-1};

                    spawnData.next = newNext(id,now,false);

                    returnObject = {data:"Slithered",code:0};

                }

            } else 
                returnObject =  {data:"Waiting to slither",code:0};

        } else if(spawnData.step == -1) { // Caught (wahoo!!!)

            spawnData = await newSpawnData(id,false);
            spawnData.next = newNext(id,now,true);

            returnObject =  {data:"Caught and regenerated spawn data",code:0};

        }            

        // Re-sync spawn data
        u.sbdb.updateGuildProperty(id,"spawning",spawnData);

        return returnObject;


    } catch(e) {
        return {data:e,code:-2};
    }

}

async function newSpawnData(id,keepPath,original) {

    const now = Date.now();

    var path = keepPath?original.path:(await location.newPath(await u.cache.client.guilds.fetch(id),now));
    if(path.code == 1) path = []; else if(path.code) path = path.data;

    return {
        path: path,
        msgId: null,
        timestamp: now,
        next: null,
        step: 0 // -2: despawned -1: caught - 0: needs emerge - 1: emerged - 2+: slithers
    };

}


function newNext(id,now,forEmerge) {
    const d = u.time.hours(24); // Duration
    const m = Math.random()*0.50+0.75; // Multiplier
    const f = u.settings.get(id,"spawning.frequency"); // Frequency
    const g = u.settings.get(id,"spawning.slithering.amount"); // Slithering amount
    if(forEmerge) return Math.floor(now+d*m/f);
    else return Math.floor(now+d*m/2/f/g); // 2 = Slithering only gets half of the spawning window of emerging
}