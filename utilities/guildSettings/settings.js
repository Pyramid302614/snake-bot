const sbdb = require("../../sbdb/sbdb.js");
const { objectProperty } = require("../values");

// d: default vaule
// s: show in configurations panel
// t: value type
// n: Pretty name

module.exports = {

    get(guildId,path) {

        if(sbdb.guildExists(guildId)) {
            
            var value = sbdb.getGuildProperty(guildId,"settings."+path);
            return value ?? defaultValue(path);

        } else return defaultValue(path);

    },

    async set(guildId,path,value) {

        if(sbdb.guildExists(guildId)) await sbdb.updateGuildProperty(guildId,"settings."+path,value);

    },

    // Returns a more presentable value for it's name that isn't the code save one like "this_and_that"
    prettyName: prettyName,

    // Returns a pretty value for it that is formatted instead of raw IDs
    prettyValue: prettyValue,

    // Returns an object a 'message' and 'success' property. Success indicates if it was parsed, and message is either the result or the error message if 'success' is false.
    parsePrettyValue: parsePrettyValue,

    settingsJSON: require("./settings.json")

}

function defaultValue(path) {
    return objectProperty(require("./settings.json"),path)?.d; // d = default value

}


async function prettyValue(settingData,value) {
    try {
        switch(settingData.t) { // Cases without anyting to the right are a part the ones below it
            case "string":
            case "integer":
            case "number": return value;
            case "boolean": return value?"Yes":"No";
            case "array":
            case "object": return JSON.parse(value,null,2);
            case "channel": return `<#${value}>`;
            case "channels": return "<#" + value.join(">, <#") + ">";
            case "guild": return `**${(await require("../../cache.js").client.guilds.fetch(value)).name}`;
            case "guilds": var result = ""; for(const guild of value) result += `\n     **${(await require("../../cache.js").client.guilds.fetch(guild)).name}`; return result;
            default: return value; // Returns same value if invalid type
        }
    } catch(ignored) {
        return value;
    }

}
function parsePrettyValue(value,type) {
    try {
        switch(type) {
            case "integer":
            case "number":
                if(type=="integer" && value.includes(".")) {
                    return {
                        message: "Decimals are not allowed for this value.",
                        success: false
                    };
                }
                const result = (type=="integer"?parseInt:parseFloat)(value.replaceAll(",",""));
                if(isNaN(result)) {
                    return {
                        message: "That is not a valid number. Please try again :)",
                        success: false
                    };
                } else {
                    return {
                        message: result,
                        success: true
                    };
                }
            case "boolean":
                return {
                    message: value.toLowerCase() === "yes",
                    success: true
                };
            default: return value;
        }
    } catch(e) {
        return {
            message: "An error occured: `"+e.message+"`",
            success: false
        };
    }
}

function prettyName(settingData) {

    return `**${settingData.n}**`;

}

function getData(path) {

    var data = require("./settings.json")[path];
    return objectProperty(data,path);

}