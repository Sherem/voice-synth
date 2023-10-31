import express from "express";
import { localPlayer } from "./local-payer.mjs";
import { VoiceCache } from "./voice-cache.mjs";
import { typeExt } from "./utils.mjs";
import { pollySynth } from "./polly-module.mjs";

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

const errorWrapper = (message, handler) => async (req, resp, next) => {
    try {
        await handler(req, resp, next);
    } catch (err) {
        log.error(`Failed to ${message}`);
        next(err);
    }
};

(async () => {
    const player = await localPlayer();
    const voiceCache = VoiceCache();

    app.get("/", (req, res) => {
        res.send("Voice guide API");
    });

    voiceApp.post(
        "/say/",
        errorWrapper("play phrase", async (req, res, next) => {
            const { phrase, type } = req.body;
            const { stream, contentType, size } = await pollySynth({
                phrase,
                type
            });
            await player.playBuffer(stream, contentType);
            log.log(`Played phrase: ${phrase} Size: ${size}`);
            res.json({ success: true });
        })
    );

    voiceApp.post(
        "/stream/",
        errorWrapper("load phrase", async (req, res) => {
            const { phrase, type } = req.body;
            const { stream, contentType, size } = await pollySynth({ phrase, type });
            const fileName = `voice.${typeExt[contentType]}`;
            res.set({
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename=${fileName}`
            });
            log.log(`Stream phrase to file: ${fileName} Size: ${size}`);
            res.status(200);
            res.end(Buffer.from(stream, "base64"));
        })
    );

    app.use("/voice", voiceApp);

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500);
        res.json({ error: err.toString() });
    });

    app.listen(port, () => {
        log.log(`Start voice guide API at port: ${port}`);
    });
})().catch(err => log.error(err));
