const Rx = require('rxjs')

const LineGroup = require('./lineGroup')

function genLineReducer (length) {
  let current = new LineGroup()

  return (acc, line, index) => {
    // NOTE
    // 1. WEBVTT: skip the line
    // 2. timestamp:
    // 2.1. if previous line group exists,
    //      store the previous line group and starts a new one
    // 2.2. otherwise, assign the timestamp to the current line group
    // 3. if no line remains, store the current line group

    if (line.match(/WEBVTT/)) {
      // 1.
      return acc
    }

    if (line.match('-->')) {
      if (current.timestamp) {
        // 2.1.
        acc = [...acc, current]
        current = new LineGroup()
      }

      current.timestamp = line // 2.2.
      return acc
    }

    current.pushLine(line)

    if (index === length - 1) {
      // 3.
      acc = [...acc, current]
    }

    return acc
  }
}

function linesToLineGroups$ (lines) {
  const trimmedLines$ = Rx.Observable
    .from(lines)
    .filter(line => line.trim().length !== 0)
    .reduce((acc, line) => [...acc, line], [])

  return trimmedLines$.flatMap(lines =>
    Rx.Observable.from(lines).reduce(genLineReducer(lines.length), [])
  )
}

function lineGroupToLine (lineGroup, idx) {
  const lines = [
    (idx + 1).toString(),
    lineGroup.timestamp,
    lineGroup.lines.join('\n')
  ]
  return lines.join('\n')
}

function prependIndexes$ (lineGroups) {
  return Rx.Observable
    .from(lineGroups)
    .map(lineGroupToLine)
    .reduce((acc, line) => [...acc, line], [])
    .map(lines => lines.join('\n\n'))
}

function vtt2srt (vtt, fn) {
  const srt$ = Rx.Observable
    .of(vtt)
    .map(content => content.split('\n'))
    .flatMap(lines => linesToLineGroups$(lines))
    .flatMap(lineGroups => prependIndexes$(lineGroups))

  // 1. invoke callback function
  if (typeof fn === 'function') {
    return srt$.subscribe(srtStr => fn(null, srtStr), fn)
  }

  // 2. no callback function, returns Promise
  return new Promise((resolve, reject) => srt$.subscribe(resolve, reject))
}

vtt2srt.FROM_FORMATS = { VTT: 'vtt' }

vtt2srt.TO_FORMATS = { SRT: 'srt' }

module.exports = vtt2srt
