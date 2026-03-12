module.exports = {

    started: false,

    client(v) {
        if(!v) return require("../cache.js").client;
        else require("../cache.js").client = v;
    },
    async start() {

        this.started = true;
        console.log("Starting : Snake Bot");

        setTimeout(this.client({ready:true}),3000);

        await new Promise(resolve => setInterval(() => {
            console.log(this.client());
            if(this.client()?.ready) resolve();
        },1000));

    }

}