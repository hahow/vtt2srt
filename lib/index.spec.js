const test = require('tape');
const vtt2srt = require('./index');

const vttStr = `WEBVTT

00:01.001 --> 00:02.002
foo

00:02.002 --> 00:03.003
bar

00:03.003 --> 00:04.004
baz`;

const expectedSrtStr = `1
00:00:01,001 --> 00:00:02,002
foo

2
00:00:02,002 --> 00:00:03,003
bar

3
00:00:03,003 --> 00:00:04,004
baz`;

test('vtt2srt', (t) => {
    t.test('with callback', (tt) => {
        tt.plan(2);

        return vtt2srt(vttStr, (err, srtStr) => {
            tt.error(err);
            tt.equal(srtStr, expectedSrtStr);
        });
    });

    t.test('without callback, returns promise', (tt) => {
        return vtt2srt(vttStr)
            .then(srtStr => {
                tt.equal(srtStr, expectedSrtStr);
                tt.end();
            })
            .catch((err) => {
                tt.error(err);
                return tt.end();
            });
    })
});
