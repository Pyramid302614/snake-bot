const { sbdb } = require("../../u");
const { objectProperty } = require("../values");

module.exports = {

    get(guildId,path) {

        if(sbdb.guildExists(guildId)) {
            
            var value = sbdb.getGuildProperty(guildId,"settings."+path);
            return value ?? defaultValue(path);

        } else return defaultValue(path);

    },

    async set(guildId,path,value) {

        if(sbdb.guildExists(guildId)) await sbdb.updateGuildProperty(guildId,"settings."+path,value);

    }

}

function defaultValue(path) {

    return objectProperty(require("./defaults.json"),path);

}