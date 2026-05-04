const defaultFormat = "<<!y years, >><<!w weeks, >><<!h hours, >><<!min minutes, >><</and >>!s.!ms seconds";

module.exports = {

    hours(v) {
        return v*60*60*1000;
    },
    minutes(v) {
        return v*60*1000;
    },

    format: format,
    defaultFormat: defaultFormat

}

const exclams = {
    "y": 1000*60*60*24*365,
    "w": 1000*60*60*24*7,
    "d": 1000*60*60*24,
    "h": 1000*60*60,
    "min": 1000*60,
    "s": 1000,
    "ms": 1,
};

function format(format,milli) {

    if(!milli) { milli = format; format = defaultFormat; }

    var result = format;
    for(const key of Object.keys(exclams)) {
        if(format.includes("!" + key)) {
            var replace = Math.floor(milli/exclams[key]);
            if(replace == 0) result = result.replace(new RegExp(`<<[^<>]*!${key}[^<>]*>>`),"");
            else {
                if(result.search(new RegExp(`<<[^<>]*!${key}[^<>]*>>`)) != -1) result = result.replaceAll(new RegExp(`<<[^<>]*!${key}[^<>]*>>`,"g"),result.match(new RegExp(`<<[^<>]*!${key}[^<>]*>>`),"g")[0].slice(2).slice(0,-2));
                if(key == "ms") for(let i = 0; i < 3-(replace+"").length; i++) replace = "0" + replace;
                result = result.replaceAll("!" + key, replace);
                milli -= Math.floor(milli/exclams[key])*exclams[key];
            }
        }
    }
    if(result.search(/<<\/[^<>]*>>/) == 0) result = result.replace(/<<\/[^<>]*>>/,"");
    if(result.search(/<<\/[^<>]*>>/) != -1) for(const match of result.match(/<<\/[^<>]*>>/g)) result = result.replaceAll(match,match.slice(3).slice(0,-2));
    result = result.replaceAll("\\>",">>").replaceAll("//<","<<");
    return result;

}