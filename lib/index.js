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

function lineReducer() {
    let current = new Line();

    return (acc, line) => {
        if (line.match(/WEBVTT/)) { // skip WEBVTT
            return acc;
        }

        if (line.match('-->')) { // time
            if (current.time) { // store previous record
                acc.push(current);
                current = new Line();
            }
            current.time = line;
            return acc;
        }

        current.pushLine(line);
        return acc;
    };
}

function linesToLineObjects$(lines) {
    return Rx.Observable.from(lines)
        .filter(line => line.trim().length !== 0)
        .reduce(lineReducer(), []);
}

function prependIndexes$(lineObjs) {
    return Rx.Observable.from(lineObjs)
        .map((lineObj, index) => {
            const lines = [];

            lines.push((index + 1).toString());
            lines.push(lineObj.time);
            lines.push(lineObj.lines.join('\n'));

            return lines.join('\n');
        })
        .reduce((acc, line) => {
            acc.push(line);
            return acc;
        }, [])
        .map(lines => lines.join('\n\n'));
}

function vtt2srtAsync(vttStr) {
    return new Promise((resolve, reject) => {
        return Rx.Observable.of(vttStr)
            .map(buffer => buffer.toString())
            .map(content => content.split('\n'))
            .flatMap(lines => linesToLineObjects$(lines))
            .flatMap(lineObjs => prependIndexes$(lineObjs))
            .subscribe(resolve, reject);
    });
}

module.exports = vtt2srtAsync;
