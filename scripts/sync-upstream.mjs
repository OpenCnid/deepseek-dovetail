import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import {
  DOVETAIL_COMMIT,
  DOVETAIL_REPOSITORY,
  EXCLUDED_CLASSES,
  MATERIALIZER_FORMAT,
  SKILL_NAMES,
} from './constants.mjs'
import { assertNoSymlink, assertRealpathInside, assertRelativePath, repositoryRoot, resolveInside } from './paths.mjs'

function argument(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

async function filesBelow(root, skipTests = true) {
  const result = []
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))
    for (const entry of entries) {
      const path = resolve(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error(`upstream runtime subset contains a symlink: ${path}`)
      if (entry.isDirectory()) {
        if (skipTests && entry.name === 'tests') continue
        await visit(path)
      } else if (entry.isFile()) {
        result.push(path)
      } else {
        throw new Error(`unsupported upstream entry: ${path}`)
      }
    }
  }
  await visit(root)
  return result
}

function git(source, ...args) {
  return execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim()
}

const sourceArg = argument('--source')
if (sourceArg === undefined) {
  throw new Error('usage: node scripts/sync-upstream.mjs --source <detached-pinned-dovetail-checkout>')
}
const source = resolve(sourceArg)
if ((await stat(source)).isDirectory() !== true) throw new Error(`source is not a directory: ${source}`)
if (git(source, 'rev-parse', 'HEAD') !== DOVETAIL_COMMIT) {
  throw new Error(`source HEAD must equal ${DOVETAIL_COMMIT}`)
}
if (git(source, 'status', '--porcelain') !== '') throw new Error('source checkout must be clean')

const commitDate = git(source, 'show', '-s', '--format=%cI', DOVETAIL_COMMIT)
const subject = git(source, 'show', '-s', '--format=%s', DOVETAIL_COMMIT)
const sourceManifest = JSON.parse(await readFile(resolve(repositoryRoot, 'ports', 'dsh', 'source-manifest.json'), 'utf8'))
const deletions = JSON.parse(await readFile(resolve(repositoryRoot, 'ports', 'dsh', 'deletions.json'), 'utf8'))
if (!Array.isArray(sourceManifest.include) || !Array.isArray(deletions)) {
  throw new Error('source manifest include and deletion manifest must be arrays')
}
const includePaths = [...new Set(sourceManifest.include.map(path => assertRelativePath(path, 'source include')))]
const deletionPaths = [...new Set(deletions.map(path => assertRelativePath(path, 'reviewed deletion')))]
const vendorRoot = resolve(repositoryRoot, 'vendor', 'dovetail')
const relativeVendor = relative(repositoryRoot, vendorRoot)
if (relativeVendor !== 'vendor\\dovetail' && relativeVendor !== 'vendor/dovetail') {
  throw new Error(`refusing unexpected vendor root: ${vendorRoot}`)
}
await rm(vendorRoot, { recursive: true, force: true })
await mkdir(vendorRoot, { recursive: true })

const included = []
for (const upstreamPath of includePaths) {
  if (!SKILL_NAMES.some(name => upstreamPath.startsWith(`skills/${name}/`))) {
    throw new Error(`source include is outside the selected skills: ${upstreamPath}`)
  }
  const file = resolveInside(source, upstreamPath, 'upstream include')
  const info = await assertNoSymlink(file, upstreamPath)
  if (!info.isFile()) throw new Error(`source include is not a file: ${upstreamPath}`)
  await assertRealpathInside(source, file)
  const target = resolveInside(vendorRoot, upstreamPath, 'vendored path')
  await mkdir(resolve(target, '..'), { recursive: true })
  await cp(file, target, { force: false, errorOnExist: true, preserveTimestamps: false })
  const bytes = await readFile(target)
  included.push({ path: upstreamPath, sha256: createHash('sha256').update(bytes).digest('hex') })
}

included.sort((left, right) => left.path.localeCompare(right.path, 'en'))
const reviewedDeletions = []
for (const deletionPath of deletionPaths) {
  const deletionSource = resolveInside(source, deletionPath, 'reviewed deletion')
  const info = await assertNoSymlink(deletionSource, deletionPath)
  const files = info.isDirectory() ? await filesBelow(deletionSource, false) : [deletionSource]
  for (const file of files) {
    await assertNoSymlink(file)
    await assertRealpathInside(source, file)
    const upstreamPath = relative(source, file).replaceAll('\\', '/')
    if (includePaths.includes(upstreamPath)) throw new Error(`path is both included and deleted: ${upstreamPath}`)
    const bytes = await readFile(file)
    reviewedDeletions.push({ path: upstreamPath, sha256: createHash('sha256').update(bytes).digest('hex') })
  }
}
reviewedDeletions.sort((left, right) => left.path.localeCompare(right.path, 'en'))

const classified = new Set([...includePaths, ...reviewedDeletions.map(entry => entry.path)])
for (const skillName of SKILL_NAMES) {
  const skillRoot = resolveInside(source, `skills/${skillName}`, `upstream skill ${skillName}`)
  for (const file of await filesBelow(skillRoot)) {
    const upstreamPath = relative(source, file).replaceAll('\\', '/')
    if (!classified.has(upstreamPath)) throw new Error(`unclassified upstream runtime file: ${upstreamPath}`)
  }
}
const lock = {
  formatVersion: MATERIALIZER_FORMAT,
  repository: DOVETAIL_REPOSITORY,
  commit: DOVETAIL_COMMIT,
  commitDate,
  subject,
  included,
  reviewedDeletions,
  excludedClasses: EXCLUDED_CLASSES,
}
await writeFile(resolve(repositoryRoot, 'upstream.lock.json'), `${JSON.stringify(lock, null, 2)}\n`, 'utf8')
process.stdout.write(`vendored ${included.length} files from ${DOVETAIL_COMMIT}\n`)
