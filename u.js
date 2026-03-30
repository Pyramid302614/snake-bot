// Utils module

module.exports = {

    file: require("./utilities/file.js"),
    dir: require("./utilities/dir.js"),
    cache: require("./cache.js"),
    log: require("./utilities/log/log.js"),
    config: require("./config.json"),
    adapter: require("./snakelet/adapter.js"),
    color: require("./utilities/color.js"),
    assets: require("./utilities/assets.js"),
    sbdb: require("./sbdb/sbdb.js"),
    values: require("./utilities/values.js"),
    settings: require("./utilities/guildSettings/settings.js"),
    msgelem: require("./utilities/commands/messageElements.js"),
    errTitles: require("./utilities/errorTitles.js"),
    snakes: {
        types: require("./systems/spawning/types.js")
    }

}

// Why would you name it u.js pyramid??? thats so undescriptive!
// u + tab makes my life very easy