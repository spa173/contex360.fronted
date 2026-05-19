#!/usr/bin/env node
// scripts/patch-lockfile.js
// Inyecta entradas de paquetes cpu:wasm32 que npm omite en x64 pero que
// npm ci valida en CI. Ejecutado via postinstall.

const fs = require('fs')
const https = require('https')
const path = require('path')

const LOCK_PATH = path.join(__dirname, '..', 'package-lock.json')

const MISSING = [
  { name: '@emnapi/core', version: '1.10.0' },
  { name: '@emnapi/runtime', version: '1.10.0' },
]

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'npm' } }, (r) => {
      let d = ''
      r.on('data', (c) => (d += c))
      r.on('end', () => res(JSON.parse(d)))
    }).on('error', rej)
  })
}

async function main() {
  const lock = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'))
  let changed = false

  for (const { name, version } of MISSING) {
    const key = `node_modules/${name}`
    if (lock.packages[key]) continue

    const meta = await get(`https://registry.npmjs.org/${name}/${version}`)
    lock.packages[key] = {
      version,
      resolved: meta.dist.tarball,
      integrity: meta.dist.integrity,
      license: 'MIT',
      optional: true,
      dependencies: { tslib: '^2.4.0' },
    }
    console.log(`[patch-lockfile] added ${name}@${version}`)
    changed = true
  }

  if (changed) {
    fs.writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2))
  }
}

main().catch((e) => {
  console.warn('[patch-lockfile] skipped:', e.message)
})
