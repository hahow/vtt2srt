let sts = require('string-to-stream')

let vtt2srt = require('../index')

describe('vtt2srt', () => {
  test('regular', () => {
    let vttStream = sts(`WEBVTT

00:00:01.001 --> 00:00:02.002
foo

00:00:02.002 --> 00:00:03.003
bar

00:00:03.003 --> 00:00:04.004
baz`)

    let expectedSrt = `1
00:00:01,001 --> 00:00:02,002
foo

2
00:00:02,002 --> 00:00:03,003
bar

3
00:00:03,003 --> 00:00:04,004
baz`

    let srt = ''

    let srtStream = vtt2srt(vttStream)

    srtStream.on('error', err => {
      expect(err).toBeUndefined()
    })

    srtStream.on('data', chunk => {
      srt += chunk
    })

    srtStream.on('end', () => {
      expect(srt).toEqual(expectedSrt)
    })
  })

  test('without hour', () => {
    let vttStream = sts(`WEBVTT

00:01.001 --> 00:02.002
foo

00:02.002 --> 00:03.003
bar`)

    let expectedSrt = `1
00:00:01,001 --> 00:00:02,002
foo

2
00:00:02,002 --> 00:00:03,003
bar`

    let srt = ''

    let srtStream = vtt2srt(vttStream)

    srtStream.on('error', err => {
      expect(err).toBeUndefined()
    })

    srtStream.on('data', chunk => {
      srt += chunk
    })

    srtStream.on('end', () => {
      expect(srt).toEqual(expectedSrt)
    })
  })

  test('as duplex', () => {
    let vttStream = sts(`WEBVTT

00:01.001 --> 00:02.002
foo

00:02.002 --> 00:03.003
bar`)

    let expectedSrt = `1
00:00:01,001 --> 00:00:02,002
foo

2
00:00:02,002 --> 00:00:03,003
bar`

    let srt = ''

    return new Promise((resolve, reject) =>
      vttStream
        .pipe(vtt2srt())
        .on('error', err => reject(err))
        .on('data', chunk => {
          srt += chunk
        })
        .on('end', () => {
          expect(srt).toEqual(expectedSrt)
          return resolve()
        })
    )
  })
})
