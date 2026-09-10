const { createCanvas, loadImage } = require("canvas");

const order = [
    "glow",
    "body",
    "tongue",
    "eyes"
];

module.exports = {

    async render(imprintData) { // imprintData: expects {type:x,char:x}

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

        return canvas.toBuffer();

    }

}