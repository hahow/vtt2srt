const Rx = require('rxjs')

class Line {
  constructor () {
    this._time = null
    this._lines = []
  }

  pushLine (line) {
    this._lines.push(line)
  }

  get lines () {
    return this._lines
  }

  get time () {
    return this._time
  }

  set time (time) {
    this._time = this._parseTime(time)
  }

  _parseTime (time) {
    const [startTime, endTime] = time.split('-->').map(s => s.trim())

    const [sHour, sMinute, sSecondWithMS] = this._fillHour(startTime)
    const [eHour, eMinute, eSecondWithMS] = this._fillHour(endTime)

    return `${sHour}:${sMinute}:${sSecondWithMS} --> ${eHour}:${eMinute}:${eSecondWithMS}`
  }

  _fillHour (time) {
    const [hour, minute, secondWithMS] = time
      .match(/^((\d+):)?(\d+):(\d+\.\d+)$/)
      .slice(2)

    // hour is missing, so secondWithMS would be undefined
    // 01:02.003 -> [01, 02.003, undefined]
    // 01:02:03.004 -> [01, 02, 03.004]
    if (!hour) {
      return ['00', minute, this._transformSecondWithMS(secondWithMS)]
    }

    return [hour, minute, this._transformSecondWithMS(secondWithMS)]
  }

  _transformSecondWithMS (secondWithMS) {
    return secondWithMS.replace('.', ',')
  }
}

function genLineReduceFunc (length) {
  let current = new Line()

  return (acc, line, index) => {
    // skip WEBVTT
    if (line.match(/WEBVTT/)) {
      return acc
    }

    // time
    if (line.match('-->')) {
      // store previous record
      if (current.time) {
        acc = [...acc, current]
        current = new Line()
      }

      current.time = line
      return acc
    }

    current.pushLine(line)

    // last line
    if (index === length - 1) {
      acc = [...acc, current]
    }

    return acc
  }
}

function linesToLineObjects$ (rawLines) {
  const strippedLines$ = Rx.Observable
    .from(rawLines)
    .filter(line => line.trim().length !== 0)
    .reduce((acc, line) => [...acc, line], [])

  return strippedLines$.flatMap(lines =>
    Rx.Observable.from(lines).reduce(genLineReduceFunc(lines.length), [])
  )
}

function lineObjToLine (lineObj, idx) {
  const lines = [(idx + 1).toString(), lineObj.time, lineObj.lines.join('\n')]
  return lines.join('\n')
}

function prependIndexes$ (lineObjs) {
  return Rx.Observable
    .from(lineObjs)
    .map(lineObjToLine)
    .reduce((acc, line) => [...acc, line], [])
    .map(lines => lines.join('\n\n'))
}

function vtt2srt (vttStr, fn) {
  const srt$ = Rx.Observable
    .of(vttStr)
    .map(content => content.split('\n'))
    .flatMap(lines => linesToLineObjects$(lines))
    .flatMap(lineObjs => prependIndexes$(lineObjs))

  // 1. invoke callback function
  if (typeof fn === 'function') {
    return srt$.subscribe(srtStr => fn(null, srtStr), fn)
  }

  // 2. no callback function, returns Promise
  return new Promise((resolve, reject) => srt$.subscribe(resolve, reject))
}

module.exports = vtt2srt
