const TIME_REGEXP = /^((\d+):)?(\d+):(\d+\.\d+)$/

class LineGroup {
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

  get timestamp () {
    return this._time
  }

  set timestamp (time) {
    this._time = this._parseTimestamp(time)
  }

  _parseTimestamp (time) {
    const [startTime, endTime] = time.split('-->').map(token => token.trim())

    const [sHour, sMinute, sSecondWithMS] = this._fillHourIfNotExists(startTime)
    const [eHour, eMinute, eSecondWithMS] = this._fillHourIfNotExists(endTime)

    return `${sHour}:${sMinute}:${sSecondWithMS} --> ${eHour}:${eMinute}:${eSecondWithMS}`
  }

  _fillHourIfNotExists (time) {
    const [hour, minute, secondWithMS] = time.match(TIME_REGEXP).slice(2)

    // hour is missing, so secondWithMS would be undefined
    // 01:02.003 -> [01, 02.003, undefined]
    // 01:02:03.004 -> [01, 02, 03.004]
    if (!hour) {
      return ['00', minute, this._replaceDotsWithCommas(secondWithMS)]
    }

    return [hour, minute, this._replaceDotsWithCommas(secondWithMS)]
  }

  _replaceDotsWithCommas (secondWithMS) {
    return secondWithMS.replace('.', ',')
  }
}

module.exports = LineGroup
