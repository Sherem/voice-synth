# Voice API using AWS Polly

## Installation

```bash
git clone git@github.com:Sherem/voice-synth.git
cd voice-synth
npm install
```

## Prerequisites

For local debugging user should have access to AWS Polly service. AWS 
credentials must be configured for local user.

## Run api

```bash
npm run start
```
## Api

### `SAY` (Mac environment only)

Will say phrase, on internal audio system. Use for local debugging.

```
POST /voice/say
```

Body

| Name       | Type     | Required | Default | Description                                                                                         |
|:-----------|:---------|:---------|:--------|:----------------------------------------------------------------------------------------------------|
| `phrase`   | `string` | yes      |         | Phrase to say                                                                                       |
| `type`     | `string` | no       | "mp3"   | Format. Possible values: "mp3", "wav", "pcm"                                                        |

### Stream

Will return stream specified format

```
POST /voice/stream
```

Body

| Name       | Type     | Required | Default | Description                                                                                         |
|:-----------|:---------|:---------|:--------|:----------------------------------------------------------------------------------------------------|
| `phrase`   | `string` | yes      |         | Phrase to say                                                                                       |
| `type`     | `string` | no       | "mp3"   | Format. Possible values: "mp3", "wav", "pcm"                                                        |
| `filename` | `string` | no       | "voice" | Filename for stream with no extension. Extension will be generated automatically depending of type  |

### Speech marks

Will generate json speech marks

```
POST /voice/marks
```

Body

| Name       | Type     | Required | Default | Description                                                   |
|:-----------|:---------|:---------|:--------|:--------------------------------------------------------------|
| `phrase`   | `string` | yes      |         | Phrase to mark                                                |
| `filename` | `string` | no       | "voice" | Filename for stream with no extension. Extension will `.json` |
