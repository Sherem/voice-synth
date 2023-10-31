import AWS from "aws-sdk";
import wavConverter from "wav-converter";

const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.WS_AWS_PROFILE });
AWS.config.credentials = credentials;
AWS.config.update({ region: "us-west-2" });

const polly = new AWS.Polly();

const defaultParams = {
    Engine: "neural",
    OutputFormat: "mp3",
    SampleRate: "16000",
    VoiceId: "Joanna"
};

export const pollySynth = async ({ phrase, type = "mp3" }) => {
    const synthType = type === "wav" ? "pcm" : type;

    const pollyParams = { ...defaultParams, Text: phrase, OutputFormat: synthType };

    const { err, AudioStream, ContentType } = await polly.synthesizeSpeech(pollyParams).promise();
    if (err) {
        throw err;
    }

    let audioData = AudioStream;
    let contentType = ContentType;
    if (type === "wav") {
        audioData = wavConverter.encodeWav(AudioStream, {
            numChannels: 1,
            byteRate: 16,
            sampleRate: pollyParams.SampleRate
        });

        contentType = "audio/vnd.wav";
    }

    return { stream: audioData, contentType, size: audioData.length, timestamp: Date.now() };
};
