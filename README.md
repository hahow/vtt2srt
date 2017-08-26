# vtt2srt [![CircleCI](https://circleci.com/gh/henry40408/vtt2srt.svg?style=shield)](https://circleci.com/gh/henry40408/vtt2srt) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Convert WEBVTT to valid SRT

## How to Use

### Install

```shell
$ npm install henry40408/vtt2srt
```

### Why not Publish on NPM?

I don't like [their solution to leftpad incident](http://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm).

### Command Line Usage

Convert VTT file to SRT file

**Notice**: This operation would WIPE OUT the content of SRT file.

```shell
$ vtt2srt -i somevttfile.vtt -o somesrtfile.srt
```

Show me the result.

```shell
$ vtt2srt -i somevttfile.vtt
```

For more information.

```shell
$ vtt2srt --help
```

## License

MIT
