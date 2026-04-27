/**
 * Generates minimal placeholder PNG icons for the extension.
 * Run: node scripts/generate-icons.mjs
 * No external dependencies — pure Node.js.
 */

import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

function uint32BE(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n, 0)
  return b
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const crc = crc32(Buffer.concat([typeBytes, data]))
  return Buffer.concat([uint32BE(data.length), typeBytes, data, uint32BE(crc)])
}

// Simple CRC32
function crc32(buf) {
  let crc = 0xffffffff
  const table = makeCrcTable()
  for (const byte of buf) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeCrcTable() {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
}

function makePng(size, r, g, b) {
  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type: RGB
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace

  // Raw pixel data (filter byte 0 per row)
  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0 // filter none
    for (let x = 0; x < size; x++) {
      row[1 + x * 3] = r
      row[2 + x * 3] = g
      row[3 + x * 3] = b
    }
    rows.push(row)
  }

  const idat = deflateSync(Buffer.concat(rows))

  return Buffer.concat([
    Buffer.from('\x89PNG\r\n\x1a\n', 'binary'),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('icons', { recursive: true })

for (const size of [16, 48, 128]) {
  const png = makePng(size, 124, 58, 237) // #7c3aed purple
  writeFileSync(`icons/icon${size}.png`, png)
  console.log(`✓ icons/icon${size}.png`)
}

console.log('Icons generated.')
