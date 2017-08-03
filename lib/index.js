const Rx = require('rxjs');

class Line {
    constructor() {
        this._time = null;
        this._lines = [];
    }

    pushLine(line) {
        this._lines.push(line);
    }

    get lines() {
        return this._lines;
    }

    get time() {
        return this._time;
    }

    set time(time) {
        this._time = this._parseTime(time);
    }

    _parseTime(time) {
        const [startTime, endTime] = time.split('-->').map(s => s.trim());
        const [sHour, sMinute, sSecondWithMS] = this._fillHour(startTime);
        const [eHour, eMinute, eSecondWithMS] = this._fillHour(endTime);
        return `${sHour}:${sMinute}:${sSecondWithMS} --> ${eHour}:${eMinute}:${eSecondWithMS}`;
    }

    _fillHour(time) {
        const [hour, minute, secondWithMS] = time.split(/:/);

        // hour is missing, so secondWithMS would be undefined
        // 01:02.003 -> [01, 02.003, undefined]
        // 01:02:03.004 -> [01, 02, 03.004]
        if (!secondWithMS) {
            return ['00', hour, this._transformSecondWithMS(minute)];
        }

        return [hour, minute, this._transformSecondWithMS(secondWithMS)];
    }

    _transformSecondWithMS(secondWithMS) {
        return secondWithMS.replace('.', ',');
    }
}

function lineReducer(length) {
    let current = new Line();

    return (acc, line, index) => {
        if (line.match(/WEBVTT/)) { // skip WEBVTT
            return acc;
        }

        if (line.match('-->')) { // time
            if (current.time) { // store previous record
                acc = [...acc, current];
                current = new Line();
            }
            current.time = line;
            return acc;
        }

        current.pushLine(line);

        if (index === length - 1) { // last line
            acc = [...acc, current];
        }

        return acc;
    };
}

function linesToLineObjects$(rawLines) {
    const lines = rawLines.filter(l => l.trim().length !== 0);
    return Rx.Observable.from(lines).reduce(lineReducer(lines.length), []);
}

function prependIndexes$(lineObjs) {
    return Rx.Observable.from(lineObjs)
        .map((lineObj, index) => [
            (index + 1).toString(),
            lineObj.time,
            lineObj.lines.join('\n'),
        ].join('\n'))
        .reduce((acc, line) => [...acc, line], [])
        .map(lines => lines.join('\n\n'));
}

function vtt2srt(vttStr, fn) {
    const stream = Rx.Observable.of(vttStr)
        .map(content => content.split('\n'))
        .flatMap(lines => linesToLineObjects$(lines))
        .flatMap(lineObjs => prependIndexes$(lineObjs));

    // 1. invoke callback function
    if (typeof fn === 'function') {
        return stream.subscribe(srtStr => fn(null, srtStr), fn);
    }

    // 2. no callback function, returns Promise
    return new Promise((resolve, reject) => {
        return stream.subscribe(resolve, reject);
    });
}

module.exports = vtt2srt;
