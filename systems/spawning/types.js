const fs = require("fs");

const dataDir = "snake-bot/systems/spawning/types.json";

module.exports = {

    getTypeData(name) {

        return JSON.parse(fs.readFileSync(dataDir,"utf-8"))?.types?.[name];

    },
    getTypeImagePath(name) {

        return getTypeDirectory(name) + "/image.png";

    },

    // Returns { name, data }
    // randomType() {

    //     const data = JSON.parse(fs.readFileSync(dataDir,"utf-8"));
    //     if(!data?.types) return null;

    //     const seed = Math.random();

    //     for(let i = 0; i < Object.keys(data.types).length; i++) {
           
    //         var key = Object.keys(data.types)[i];
    //         var value = data.types[key];

    //         if(seed<(value.chance??0)) return {
    //             name: key,
    //             data: value
    //         };

    //     }

    // }

    randomType(id) {

        const data = JSON.parse(fs.readFileSync(dataDir,"utf-8"));
        if(!data?.types) return null;

        const now = Date.now();

        for(var i = 0; i < Object.keys(data.types).length; i++) {
            
            const key = Object.keys(data.types)[i];
            const value = data.types[key];
            
            if(
                (Math.random() <= value.chance) ||
                ((now - require("../../sbdb/sbdb.js").getGuildProperty(id,"addedTimestamp")) < (Object.values(data.types)[i+1].minAge ?? 0))
            )
                return {
                    name: key,
                    data: value
                };
            
        }
    
    },

    testRandomTypes(id) {

        var result = [];
        for(var i = 0; i < 20; i++) {
            result.push(this.randomType(id).name);
        }
        return result.join("\n");

    }

}

function getTypeDirectory(name) {
    
    return JSON.parse(fs.readFileSync(dataDir,"utf-8"))?.assetsdir + "/" + name;

}