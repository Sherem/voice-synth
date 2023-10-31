export const typeExt = {
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/pcm": "pcm",
    "audio/vnd.wav": "wav",
    "audio/json": "json",
    "application/x-json-stream": "json"
};

export const extType = Object.keys(typeExt).reduce((res, key) => ({ ...res, [typeExt[key]]: key }), {});
