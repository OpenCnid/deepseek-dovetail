import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { repositoryRoot } from './paths.mjs'

async function digestTree(root) {
  const hash = createHash('sha256')
  async function visit(directory, prefix = '') {
    const entries = await readdir(directory, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))
    for (const entry of entries) {
      const relativePath = `${prefix}${entry.name}`
      if (entry.isSymbolicLink()) throw new Error(`generated tree contains symlink: ${relativePath}`)
      if (entry.isDirectory()) await visit(resolve(directory, entry.name), `${relativePath}/`)
      else if (entry.isFile()) {
        hash.update(relativePath)
        hash.update('\0')
        hash.update(await readFile(resolve(directory, entry.name)))
        hash.update('\0')
      }
    }
  }
  await visit(root)
  return hash.digest('hex')
}

const generated = resolve(repositoryRoot, 'dist', 'skills')
const before = await digestTree(generated)
execFileSync(process.execPath, [resolve(repositoryRoot, 'scripts', 'materialize-skills.mjs')], {
  cwd: repositoryRoot,
  stdio: 'inherit',
})
const after = await digestTree(generated)
if (before !== after) throw new Error(`materialization is not deterministic: ${before} != ${after}`)

const manifest = JSON.parse(await readFile(resolve(repositoryRoot, 'package.json'), 'utf8'))
const serialized = JSON.stringify(manifest)
if (/(?:file:|link:|workspace:|git\+|github:)/u.test(serialized)) {
  throw new Error('package metadata contains a forbidden local/workspace/Git dependency')
}
if (manifest.private !== true) throw new Error('package must remain private')
process.stdout.write(`deterministic generated tree ${after}\n`)
