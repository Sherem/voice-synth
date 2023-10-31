import Player from "play-sound";
import { promises as fs } from "fs";
import os from "os";
import * as path from "path";
import { typeExt } from "./utils.mjs";

const player = Player({});

const playFile = file => new Promise((resolve, reject) => player.play(file, err => (err ? reject(err) : resolve())));

export const localPlayer = async () => {
    let counter = 0;
    const tempPath = path.join(os.tmpdir(), "voice-synth-");
    const tmpFolder = await fs.mkdtemp(tempPath);

    return {
        playBuffer: async (buffer, contentType = "audio/mpeg") => {
            const fileExt = typeExt[contentType];
            if (!fileExt) {
                throw Error(`Content type ${contentType} is not supported`);
            }
            counter++;
            const filename = path.join(tmpFolder, `voice-${counter}.${fileExt}`);
            await fs.writeFile(filename, buffer);
            console.log(`Playing file: ${filename}`);
            return playFile(filename);
        }
    };
};
