import express from "express";
import OpenAI from "openai";

import { localPlayer } from "./local-payer.mjs";
import { VoiceCache } from "./voice-cache.mjs";
import { typeExt } from "./utils.mjs";
import { pollySynth, speechMarks } from "./polly-module.mjs";

const openai = new OpenAI();
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

    app.get("/", (req, res) => {
        res.send("Voice guide API");
    });

    app.get("/question/:text", async (req, res) => {
      if (req.params.text) {
        const completion = await openai.chat.completions.create({
          messages: [{ role: "system", content: req.params.text }],
          model: "gpt-4",
        });

        res.send(completion.choices[0]);
      } else {
        res.send("Not text value");
      }
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
            const { phrase, type, filename = "voice" } = req.body;
            const { stream, contentType, size } = await pollySynth({ phrase, type });
            const fileName = `${filename}.${typeExt[contentType]}`;
            res.set({
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename=${fileName}`
            });
            log.log(`Stream phrase to file: ${fileName} Size: ${size}`);
            res.status(200);
            res.end(Buffer.from(stream, "base64"));
        })
    );

    voiceApp.post(
        "/marks/",
        errorWrapper("make marks", async (req, res) => {
            const { phrase, type, filename = "voice" } = req.body;
            const { stream, contentType, size } = await speechMarks({ phrase, type });
            const fileName = `${filename}.${typeExt[contentType]}`;
            res.set({
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename=${fileName}`
            });
            log.log(`Stream phrase to file: ${fileName} Size: ${size}`);
            res.status(200);
            res.end(Buffer.from(stream, "utf-8"));
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
