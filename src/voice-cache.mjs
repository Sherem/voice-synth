import { createHash } from "crypto";
import { pollySynth } from "./polly-module.mjs";

const DEFAULT_CACHE_SIZE = 1015808; // 8 MB
export const VoiceCache = (maxCacheSize = DEFAULT_CACHE_SIZE) => {
    const cacheMap = new Map();
    let cacheSize = 0;
    const makeHash = (phrase, type) => createHash("md5").update(`${phrase}${type}`).digest("hex");
    const cleanCache = candidateSize => {
        let newSize = cacheSize + candidateSize;
        if (newSize > maxCacheSize) {
            const line = Array.from(cacheMap, ([hash, { size, timestamp }]) => ({ hash, size, timestamp })).sort(
                ({ timestamp: ts1 }, { timestamp: ts2 }) => ts1 - ts2
            );

            for (let i = 0; i < line.length; i++) {
                const { size, hash } = line[i];
                cacheMap.delete(hash);
                newSize -= size;
                if (newSize < maxCacheSize) {
                    break;
                }
            }
        }
    };
    const say = async ({ phrase, type }) => {
        const hash = makeHash(phrase, type);
        let voiceData = cacheMap.get(hash);

        if (!voiceData) {
            voiceData = await pollySynth({ phrase, type });
            const { size } = voiceData;
            cleanCache(size);
            cacheSize += size;
            cacheMap.set(hash, voiceData);
        }

        return voiceData;
    };

    return {
        say
    };
};
