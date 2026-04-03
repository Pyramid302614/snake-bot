const u = require("../../u");
const location = require("./location");

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

// async function checkGuild(id) {

//     try {
        
//         const spawnData = u.sbdb.getGuildProperty(id,"spawning");
//         if(!spawnData) await u.sbdb.updateGuildProperty(id,"spawning",newSpawnData(id));

//         if(snake)

//     } catch(e) {
//         return {data:e,code:-2};
//     }

// }

// function newSpawnData(id) {

//     const now = Date.now();

//     return {
//         path: location.newPath(id,now),
//         instance: {
//             timestamp: now,
//             next: now+Math.floor(Math.random()),
//             step: 0 // -1: caught - 0: needs emerge - 1: emerged - 2+: slithers
//         }
//     };

// }