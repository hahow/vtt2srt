const test = require('tape')
const vtt2srt = require('./index')

test('vtt2srt', tape => {
  const vtt = `WEBVTT

00:00:01.001 --> 00:00:02.002
foo`

  const expectedSrt = `1
00:00:01,001 --> 00:00:02,002
foo`

  return vtt2srt(vtt)
    .then(srt => {
      tape.equal(srt, expectedSrt)
      return tape.end()
    })
    .catch(err => {
      tape.error(err)
      return tape.end()
    })
})

test('vtt2srt without hour', tape => {
  const vtt = `WEBVTT

00:01.001 --> 00:02.002
foo

00:02.002 --> 00:03.003
bar`

  const expectedSrt = `1
00:00:01,001 --> 00:00:02,002
foo

2
00:00:02,002 --> 00:00:03,003
bar`

  tape.test('with callback', subTape => {
    subTape.plan(2)

    return vtt2srt(vtt, (err, srtStr) => {
      subTape.error(err)
      subTape.equal(srtStr, expectedSrt)
    })
  })

  tape.test('without callback, returns promise', subTape => {
    return vtt2srt(vtt)
      .then(srtStr => {
        subTape.equal(srtStr, expectedSrt)
        return subTape.end()
      })
      .catch(err => {
        subTape.error(err)
        return subTape.end()
      })
  })
})
