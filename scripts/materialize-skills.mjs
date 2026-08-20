import { createHash } from 'node:crypto'
import { cp, lstat, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { MATERIALIZER_FORMAT, SKILL_NAMES } from './constants.mjs'
import { assertNoSymlink, assertRelativePath, repositoryRoot, resolveInside } from './paths.mjs'

const vendorRoot = resolve(repositoryRoot, 'vendor', 'dovetail')
const overlayRoot = resolve(repositoryRoot, 'ports', 'dsh')
const outputRoot = resolve(repositoryRoot, 'dist', 'skills')

async function loadJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function verifyLock() {
  const lock = await loadJson(resolve(repositoryRoot, 'upstream.lock.json'))
  if (lock.formatVersion !== MATERIALIZER_FORMAT) throw new Error('unsupported upstream lock format')
  if (!Array.isArray(lock.included) || lock.included.length === 0) throw new Error('upstream lock has no included files')
  if (!Array.isArray(lock.reviewedDeletions)) throw new Error('upstream lock has no reviewed deletion evidence')
  for (const entry of lock.included) {
    const path = resolveInside(vendorRoot, assertRelativePath(entry.path, 'locked upstream path'))
    const info = await assertNoSymlink(path, entry.path)
    if (!info.isFile()) throw new Error(`locked path is not a file: ${entry.path}`)
    const digest = createHash('sha256').update(await readFile(path)).digest('hex')
    if (digest !== entry.sha256) throw new Error(`vendored hash mismatch: ${entry.path}`)
  }
  return lock
}

async function copyOverlay(directory, destination) {
  const entries = await readdir(directory, { withFileTypes: true })
  entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))
  for (const entry of entries) {
    const source = resolve(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`overlay must not contain symlinks: ${source}`)
    const target = resolve(destination, entry.name)
    if (entry.isDirectory()) {
      await mkdir(target, { recursive: true })
      await copyOverlay(source, target)
    } else if (entry.isFile()) {
      await mkdir(resolve(target, '..'), { recursive: true })
      await cp(source, target, { force: true, preserveTimestamps: false })
    } else {
      throw new Error(`unsupported overlay entry: ${source}`)
    }
  }
}

function parseSkill(text, path) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/u.exec(text)
  if (match === null) throw new Error(`${path}: missing YAML frontmatter or body`)
  const frontmatter = parseYaml(match[1])
  if (frontmatter === null || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
    throw new Error(`${path}: frontmatter must be a mapping`)
  }
  return { frontmatter, body: match[2] }
}

function normalizedDescription(value) {
  return value.replace(/\r\n?/gu, '\n').replace(/\s+/gu, ' ').trim()
}

async function validateGeneratedTree() {
  const directories = (await readdir(outputRoot, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'))
  if (JSON.stringify(directories) !== JSON.stringify(SKILL_NAMES)) {
    throw new Error(`generated skill names differ: ${directories.join(', ')}`)
  }
  for (const name of SKILL_NAMES) {
    const skillPath = resolveInside(outputRoot, `${name}/SKILL.md`, 'generated SKILL.md')
    const { frontmatter, body } = parseSkill(await readFile(skillPath, 'utf8'), skillPath)
    if (frontmatter.name !== name) throw new Error(`${name}: frontmatter name must match directory`)
    if (typeof frontmatter.description !== 'string') throw new Error(`${name}: description must be a string`)
    const description = normalizedDescription(frontmatter.description)
    if (description.length === 0 || description.length > 480) {
      throw new Error(`${name}: parsed description length ${description.length} is outside 1..480`)
    }
    if (body.trim() === '') throw new Error(`${name}: body is empty`)
    if ('disableModelInvocation' in frontmatter || 'userInvocable' in frontmatter) {
      throw new Error(`${name}: camel-case invocation policy is unsupported`)
    }
    const expectedExplicitOnly = name === 'spark-steering' || name === 'upsum'
    if ((frontmatter['disable-model-invocation'] === true) !== expectedExplicitOnly) {
      throw new Error(`${name}: incorrect model invocation policy`)
    }
    if (frontmatter['user-invocable'] === false) throw new Error(`${name}: must remain user invocable`)
    const license = name === 'better-skill-creator' ? 'LICENSE.txt' : 'LICENSE.md'
    if (!(await stat(resolveInside(outputRoot, `${name}/${license}`))).isFile()) {
      throw new Error(`${name}: missing adjacent ${license}`)
    }
  }
  if (!(await stat(resolveInside(outputRoot, 'better-skill-creator/NOTICE'))).isFile()) {
    throw new Error('better-skill-creator: missing NOTICE')
  }
}

const lock = await verifyLock()
const rel = relative(repositoryRoot, outputRoot)
if (rel !== 'dist\\skills' && rel !== 'dist/skills') throw new Error(`refusing unexpected output root: ${outputRoot}`)
await rm(outputRoot, { recursive: true, force: true })
await mkdir(outputRoot, { recursive: true })
for (const entry of lock.included) {
  const source = resolveInside(vendorRoot, entry.path, 'locked upstream path')
  const generatedPath = entry.path.replace(/^skills\//u, '')
  if (generatedPath === entry.path) throw new Error(`locked path is outside skills/: ${entry.path}`)
  const target = resolveInside(outputRoot, generatedPath, 'generated path')
  await mkdir(resolve(target, '..'), { recursive: true })
  await cp(source, target, { force: false, errorOnExist: true, preserveTimestamps: false })
}
const deletions = await loadJson(resolve(overlayRoot, 'deletions.json'))
if (!Array.isArray(deletions)) throw new Error('deletions.json must be an array')
for (const deletion of deletions) {
  const normalized = assertRelativePath(deletion, 'deletion path')
  const generatedPath = normalized.replace(/^skills\//u, '')
  if (generatedPath === normalized) throw new Error(`deletion must start with skills/: ${deletion}`)
  const target = resolveInside(outputRoot, generatedPath, 'deletion target')
  const info = await lstat(target).catch(error => error?.code === 'ENOENT' ? undefined : Promise.reject(error))
  if (info === undefined) {
    const covered = lock.reviewedDeletions.some(entry => entry.path === normalized || entry.path.startsWith(`${normalized}/`))
    if (!covered) throw new Error(`reviewed deletion is stale or missing: ${deletion}`)
    continue
  }
  if (info.isSymbolicLink() || info.isFile()) await rm(target)
  else await rm(target, { recursive: true })
}
const skillOverlays = resolve(overlayRoot, 'skills')
await copyOverlay(skillOverlays, outputRoot)
await validateGeneratedTree()
process.stdout.write(`materialized ${SKILL_NAMES.length} DSH skills from ${lock.included.length} pinned files\n`)
