import { lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { repositoryRoot } from './paths.mjs'
import { SKILL_NAMES } from './constants.mjs'

const outputRoot = resolve(repositoryRoot, 'dist', 'skills')
const markdownLink = /\[[^\]]*\]\(([^)\s]+)\)/gu
const resourceCode = /`((?:scripts|references|assets|agents|eval-viewer)\/[A-Za-z0-9_./-]+)`/gu

function targetPart(value) {
  return decodeURIComponent(value.split('#', 1)[0].split('?', 1)[0]).replaceAll('\\', '/')
}

async function verifyTarget(skillRoot, source, rawTarget, base = dirname(source)) {
  if (rawTarget === '' || rawTarget.startsWith('#') || /^[a-z][a-z0-9+.-]*:/iu.test(rawTarget)) return
  const target = targetPart(rawTarget)
  if (target === '') return
  const absolute = resolve(base, target)
  const rel = relative(skillRoot, absolute)
  if (rel === '..' || rel.startsWith(`..${sep}`) || rel === '') {
    if (rel !== '') throw new Error(`${source}: resource escapes skill directory: ${rawTarget}`)
  }
  const info = await lstat(absolute).catch(error => error?.code === 'ENOENT' ? undefined : Promise.reject(error))
  if (info === undefined) throw new Error(`${source}: missing resource: ${rawTarget}`)
  if (info.isSymbolicLink()) throw new Error(`${source}: resource is a symlink: ${rawTarget}`)
  const [realRoot, realTarget] = await Promise.all([realpath(skillRoot), realpath(absolute)])
  const realRel = relative(realRoot, realTarget)
  if (realRel === '..' || realRel.startsWith(`..${sep}`)) {
    throw new Error(`${source}: resource resolves outside skill directory: ${rawTarget}`)
  }
}

async function markdownBelow(root) {
  const result = []
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))
    for (const entry of entries) {
      const path = resolve(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error(`generated resource is a symlink: ${path}`)
      if (entry.isDirectory()) await visit(path)
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) result.push(path)
    }
  }
  await visit(root)
  return result
}

for (const skillName of SKILL_NAMES) {
  const skillRoot = resolve(outputRoot, skillName)
  for (const source of await markdownBelow(skillRoot)) {
    const text = await readFile(source, 'utf8')
    const markdownTargets = new Set()
    const resourceTargets = new Set()
    for (const match of text.matchAll(markdownLink)) markdownTargets.add(match[1])
    for (const match of text.matchAll(resourceCode)) resourceTargets.add(match[1])
    for (const target of [...markdownTargets].sort()) await verifyTarget(skillRoot, source, target)
    for (const target of [...resourceTargets].sort()) await verifyTarget(skillRoot, source, target, skillRoot)
  }
}

for (const directory of [outputRoot]) {
  const entries = await readdir(directory)
  if (entries.length === 0) throw new Error('generated resource tree is empty')
}
process.stdout.write('resource closure verified recursively for all packaged Markdown references\n')
