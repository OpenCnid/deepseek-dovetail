import { execFileSync } from 'node:child_process'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { parse } from 'yaml'

const root = process.cwd()
const manifest = JSON.parse(await readFile(path.resolve(root, 'package.json'), 'utf8'))
if (manifest.name !== 'deepseek-dovetail' || manifest.private !== true) throw new Error('package identity/private flag changed')
if (manifest.dsh?.bundle?.patch !== './cordis.patch.yml') throw new Error('missing package-owned DSH bundle patch')
const forbiddenDependency = /^(?:file:|link:|workspace:|git(?:\+|:)|https?:)|^(?:[A-Za-z]:[\\/]|\/)/u
for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
  for (const [name, specifier] of Object.entries(manifest[section] ?? {})) {
    if (forbiddenDependency.test(String(specifier))) throw new Error(`${section}.${name} is not registry-pinned: ${specifier}`)
  }
}

const patch = parse(await readFile(path.resolve(root, 'cordis.patch.yml'), 'utf8'))
if (!Array.isArray(patch) || patch.length !== 1) throw new Error('bundle patch must contain exactly one operation')
const rows = patch[0]?.insert
if (!Array.isArray(rows) || rows.length !== 1 || rows[0]?.id !== 'deepseek-dovetail' || rows[0]?.name !== 'deepseek-dovetail') {
  throw new Error('bundle patch must insert exactly one complete deepseek-dovetail row')
}

const forbiddenPaths = [
  '.codex-plugin/plugin.json',
  'marketplace.json',
  'mcp.json',
  'hooks/hooks.json',
]
for (const relative of forbiddenPaths) {
  await access(path.resolve(root, relative)).then(
    () => { throw new Error(`forbidden plugin surface exists: ${relative}`) },
    error => { if (error?.code !== 'ENOENT') throw error },
  )
}

const built = await import(pathToFileURL(path.resolve(root, 'lib', 'index.js')).href)
if (typeof built.Host !== 'object' || typeof built.Host?.apply !== 'function' || built.name !== 'deepseek-dovetail') {
  throw new Error('built public Host export is not importable')
}
const normalizedRoot = String(built.packageSkillRoot).replaceAll('\\', '/')
if (!normalizedRoot.endsWith('/dist/skills/')) throw new Error(`built packageSkillRoot is not package-relative: ${normalizedRoot}`)

const python = process.env.PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3')
const validator = path.resolve(root, 'dist', 'skills', 'better-skill-creator', 'scripts', 'quick_validate.py')
for (const entry of await readdir(path.resolve(root, 'dist', 'skills'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  execFileSync(python, [validator, path.resolve(root, 'dist', 'skills', entry.name)], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

console.log('package contract, built export, and eight Python validations PASS')
