# Voice API using AWS Polly

## Installation

```bash
git clone git@github.com:Sherem/voice-synth.git
cd voice-synth
npm install
```
## Run api

```bash
npm run start
```
## Api

### `SAY` (Mac environment only)

Will say phrase, on internal audio system. Use for local debugging.

```
GET /voice/say
```

Body

| name     | type     | description                                  |
|----------|----------|----------------------------------------------|
| `phrase` | `string` | Phrase to say                                |
| `type`   | `string` | Format. Possible values: "mp3", "wav", "pcm" |


### Stream

Will return stream specified format

```
GET /voice/stream
```

Body

| name     | type     | description                                  |
|----------|----------|----------------------------------------------|
| `phrase` | `string` | Phrase to say                                |
| `type`   | `string` | Format. Possible values: "mp3", "wav", "pcm" |
