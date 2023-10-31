import express from "express";
import { localPlayer } from "./local-payer.mjs";
import { VoiceCache } from "./voice-cache.mjs";
import { typeExt } from "./utils.mjs";

const log = console;
const port = 3001;
const app = express();
app.use(express.json());

const voiceApp = express();

const checkParams = (req, res, next) => {
    const { phrase, type } = req.body;
    let message;
    if (!phrase) {
        message = "Phrase is empty";
    }
    if (type && !["mp3", "pcm", "ogg_vorbis", "wav"].includes(type)) {
        message = "Wrong output format (type)";
    }
    if (message) {
        log.error(message);
        res.status(400).send(message);
    } else {
        next();
    }
};

voiceApp.use(checkParams);

(async () => {
    const player = await localPlayer();
    const voiceCache = VoiceCache();

    app.get("/", (req, res) => {
        res.send("Voice guide API");
    });

    voiceApp.post("/say/", async (req, res) => {
        const { phrase, type } = req.body;
        const { stream, contentType, size } = await voiceCache.say({ phrase, type });
        player
            .playBuffer(stream, contentType)
            .then(() => {
                log.log(`Played phrase: ${phrase} Size: ${size}`);
            })
            .catch(err => {
                log.error(`Error play phrase`);
                log.error(err);
            });
        res.json({ success: true });
    });

    voiceApp.post("/stream/", async (req, res) => {
        const { phrase, type } = req.body;
        const { stream, contentType, size } = await voiceCache.say({ phrase, type });
        const fileName = `voice.${typeExt[contentType]}`;
        res.set({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename=${fileName}`
        });
        log.log(`Stream phrase to file: ${fileName} Size: ${size}`);
        res.status(200);
        res.end(Buffer.from(stream, "base64"));
    });

    app.use("/voice", voiceApp);

    app.listen(port, () => {
        log.log(`Start voice guide API at port: ${port}`);
    });
})().catch(err => log.error(err));
