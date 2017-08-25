const sts = require('string-to-stream')
const test = require('tape')

const vtt2srt = require('./index')

test('vtt2srt', tape => {
  const vttStream = sts(`WEBVTT

00:00:01.001 --> 00:00:02.002
foo`)

  const expectedSrt = `1
00:00:01,001 --> 00:00:02,002
foo`

  let srt = ''

  const srtStream = vtt2srt(vttStream)

  srtStream.on('error', tape.ifError.bind(tape))

  srtStream.on('data', chunk => {
    srt += chunk
  })

  srtStream.on('end', () => {
    tape.equal(srt, expectedSrt)
    tape.end()
  })
})

test('vtt2srt without hour', tape => {
  const vttStream = sts(`WEBVTT

00:01.001 --> 00:02.002
foo

00:02.002 --> 00:03.003
bar`)

  const expectedSrt = `1
00:00:01,001 --> 00:00:02,002
foo

2
00:00:02,002 --> 00:00:03,003
bar`

  let srt = ''

  const srtStream = vtt2srt(vttStream)

  srtStream.on('error', tape.ifError.bind(tape))

  srtStream.on('data', chunk => {
    srt += chunk
  })

  srtStream.on('end', () => {
    tape.equal(srt, expectedSrt)
    tape.end()
  })
})
