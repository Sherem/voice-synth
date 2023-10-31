export const typeExt = {
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/pcm": "pcm",
    "audio/vnd.wav": "wav"
};

export const extType = Object.keys(typeExt).reduce((res, key) => ({ ...res, [typeExt[key]]: key }), {});
