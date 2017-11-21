let es = require('event-stream')

let LineGroup = require('./lineGroup')

/**
 * Duplex stream converting VTT subtitles to SRT subtitles
 *
 * @example
 * readableStream.pipe(vtt2srt.split()).pipe(vtt2srt.duplex())
 */
function processLines () {
  let index = 1
  let current = new LineGroup(index)

  return es.through(
    function write (line) {
      if (typeof line !== 'string') {
        throw new Error('expect string, but got ' + typeof line)
      }

      // NOTE
      // 1. WEBVTT: skip the line
      // 2. timestamp:
      // 2.1. if previous line group exists,
      //      store the previous line group and starts a new one
      // 2.2. otherwise, assign the timestamp to the current line group
      // 3. if no line remains, store the current line group

      if (line.match(/WEBVTT/)) {
        // 1.
        return
      }

      if (line.match('-->')) {
        if (current.timestamp) {
          // 2.1.
          this.emit('data', `${current.toString()}\n\n`)
          index += 1
          current = new LineGroup(index)
        }

        current.timestamp = line // 2.2.
        return
      }

      if (line.trim()) {
        // NOTE skip empty line
        current.pushLine(line)
      }
    },
    function end () {
      // NOTE flush the last line group
      this.emit('data', current.toString())
      this.emit('end')
    }
  )
}

/**
 * Convert VTT format subtitles to SRT format
 *
 * @param {Readable} vttStream Readable stream of VTT format subtitles, returns duplex stream if omitted
 * @returns {Duplex} Duplex stream of SRT format subtitles, line by line
 */
function vtt2srt (vttStream) {
  if (typeof vttStream !== 'undefined') {
    return vttStream.pipe(es.split()).pipe(processLines())
  }
  return es.pipe(es.split(), processLines())
}

vtt2srt.FROM_FORMATS = { VTT: 'vtt' }

vtt2srt.TO_FORMATS = { SRT: 'srt' }

module.exports = vtt2srt
