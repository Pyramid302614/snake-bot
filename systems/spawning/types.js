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
    randomType() {

        const data = JSON.parse(fs.readFileSync(dataDir,"utf-8"));
        if(!data?.types) return null;

        const seed = Math.random();

        for(let i = 0; i < Object.keys(data.types).length; i++) {
           
            var key = Object.keys(data.types)[i];
            var value = data.types[key];

            if(seed<(value.chance??0)) return {
                name: key,
                data: value
            };

        }

    }

}

function getTypeDirectory(name) {
    
    return JSON.parse(fs.readFileSync(dataDir,"utf-8"))?.assetsdir + "/" + name;

}