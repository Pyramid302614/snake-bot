const fs = require("fs");

const dir = "snakelet/data";
const sectors = 10; // 0-indexed

module.exports = {
    getSync: getSync,
    get: get,
    writeSync: writeSync,
    write: write,
    async backupAllSectors() {
        for(var sector = 0; sector < sectors; sector++) {
            var data = null;
            try {
                data = getSync(sector);
                if(data) fs.writeFileSync(getSectorPath(sector),JSON.stringify({data:data,timestamp:Date.now()},null,2),"utf-8");
            } catch(ignored) {}
        }
    }
}

function getSync(sector) {
    return JSON.parse(fs.readFileSync(getSectorPath(sector),"utf-8")??"{}");
}
async function get(sector,then) {
    fs.readFile(getSectorPath(sector),"utf-8",(err,dat) => then(err,JSON.parse(dat??"{}")));
}

function writeSync(sector,data) {
    fs.writeFileSync(getSectorPath(sector),JSON.stringify(data,null,2),"utf-8");
}
async function write(sector,data,then) {
    fs.writeFile(getSectorPath(sector),JSON.stringify(data,null,2),"utf-8",then);
}

function getSectorPath(sector) {
    return dir+"/sector_"+sector+".json";
}