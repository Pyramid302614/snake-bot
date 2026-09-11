const { createCanvas, loadImage } = require("canvas");

const order = [
    "glow",
    "body",
    "tongue",
    "eyes"
];

module.exports = {

    async render(imprintData,draft) { // imprintData: expects {type:x,char:x}

        const canvas = createCanvas(800,700);
        const g = canvas.getContext("2d");

        // old (String format, char>type,char>type,char>type)
        // const imprints = imprintData.split(",").map(i => { return {
        //     char: i.split(">")[0],
        //     type: i.split(">")[1]
        // }});
        const imprints = imprintData;

        for(const char of order) {

            for(const imprint of imprints) if(imprint.char == char) {

                const image = await loadImage(process.cwd()+`/snake-bot/assets/images/snakes/${imprint.type}/${imprint.char}.svg`);

                g.drawImage(
                    image,
                    (canvas.width - image.width - (require("../../assets/images/snakes/snakes.json").offsets?.[imprint.type]?.x ?? 0))/2,
                    (canvas.height - image.height - (require("../../assets/images/snakes/snakes.json").offsets?.[imprint.type]?.y ?? 0))/2
                );


            }

        }

        if(draft) {
            g.strokeStyle = "rgba(255,255,255,125)";
            g.lineWidth = 4;
            g.strokeRect(20,20,canvas.width-40,canvas.height-40);
            g.fillStyle = "white";
            g.font = "40px Arial";
            g.fillText("PREVIEW",40,40+g.measureText("PREVIEW").actualBoundingBoxAscent);
        }

        return canvas.toBuffer();

    }

}