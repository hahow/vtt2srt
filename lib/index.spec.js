const test = require('tape')
const vtt2srt = require('./index')

test('vtt2srt', t => {
  const vttStr = `WEBVTT

00:00:01.001 --> 00:00:02.002
foo`

  const expectedSrtStr = `1
00:00:01,001 --> 00:00:02,002
foo`

  return vtt2srt(vttStr)
    .then(srtStr => {
      t.equal(srtStr, expectedSrtStr)
      return t.end()
    })
    .catch(err => {
      t.error(err)
      return t.end()
    })
})

test('vtt2srt without hour', t => {
  const vttStr = `WEBVTT

00:01.001 --> 00:02.002
foo

00:02.002 --> 00:03.003
bar`

  const expectedSrtStr = `1
00:00:01,001 --> 00:00:02,002
foo

2
00:00:02,002 --> 00:00:03,003
bar`

  t.test('with callback', tt => {
    tt.plan(2)

    return vtt2srt(vttStr, (err, srtStr) => {
      tt.error(err)
      tt.equal(srtStr, expectedSrtStr)
    })
  })

  t.test('without callback, returns promise', tt => {
    return vtt2srt(vttStr)
      .then(srtStr => {
        tt.equal(srtStr, expectedSrtStr)
        return tt.end()
      })
      .catch(err => {
        tt.error(err)
        return tt.end()
      })
  })
})
