const dataPath = "snake-bot/systems/announcements/announcements.json";

module.exports = {

    announce(title,content) {

        const data = getData();
        if(data.announcements === undefined) data.announcements = [];
        data.announcements.push({
            title: title,
            content: content,
            timestamp: Date.now()
        });
        setData(data);

    },

    getAllNew(since) {

        const output = [];

        for(const a of getData()?.announcements ?? []) {
            
            if(a.timestamp >= since) a.push(a);
            
        }

        return output;

    },

    getAll() {

        return getData()?.announcements ?? [];

    }

}
 

// Gets file contents
function getData() {
    if(!require("fs").existsSync(dataPath)) return {announcements:[]};
    return JSON.parse(require("fs").readFileSync(dataPath,"utf-8"));
}
// Overrides file contents
function setData(obj) {
    require("fs").writeFileSync(dataPath,JSON.stringify(obj,null,2),"utf-8");
}