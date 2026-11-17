import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'

const required = [
  'dist/renderer/index.html',
  'dist-electron/main.js',
  'dist-electron/preload.mjs',
  'public/branding/teapro-icon.svg',
]

const missing = required.filter((path) => !existsSync(path))
if (missing.length) {
  console.error(`Release verification failed. Missing:\n${missing.map((p) => `- ${p}`).join('\n')}`)
  process.exit(1)
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (!pkg.build?.appId || !pkg.build?.nsis) {
  console.error('Release verification failed: electron-builder metadata is incomplete.')
  process.exit(1)
}

console.log(`Release inputs verified for ${pkg.productName ?? pkg.name} ${pkg.version}.`)
