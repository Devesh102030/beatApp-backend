// Run this with: node create-icons.js
// Creates simple placeholder PNG icons for the extension
// In production, replace with real icons

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'

const sizes = [16, 48, 128]

mkdirSync('icons', { recursive: true })

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#7c3aed'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()

  // Music note
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${size * 0.6}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('♪', size / 2, size / 2)

  writeFileSync(`icons/icon${size}.png`, canvas.toBuffer('image/png'))
  console.log(`Created icons/icon${size}.png`)
}
