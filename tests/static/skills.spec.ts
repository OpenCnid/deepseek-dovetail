import { createHash } from 'node:crypto'
import { readFile, readdir, lstat } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parse as parseYaml } from 'yaml'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const skillRoot = resolve(root, 'dist', 'skills')
const expectedNames = [
  'better-skill-creator',
  'hypershot-protocol',
  'judge-composition',
  'prompt-engineering',
  'self-play',
  'spark-steering',
  'subagent-composition',
  'upsum',
]

function parseSkill(text: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/u.exec(text)
  if (match?.[1] === undefined || match[2] === undefined) throw new Error('invalid skill document')
  const parsed: unknown = parseYaml(match[1])
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('invalid frontmatter')
  return { frontmatter: parsed as Record<string, unknown>, body: match[2] }
}

async function filesBelow(directory: string): Promise<string[]> {
  const result: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`symlink: ${path}`)
    if (entry.isDirectory()) result.push(...await filesBelow(path))
    else if (entry.isFile()) result.push(path)
  }
  return result
}

describe('generated DSH skill corpus', () => {
  it('has exactly eight valid names, complete descriptions, and exact invocation policy', async () => {
    const names = (await readdir(skillRoot, { withFileTypes: true }))
      .filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
    expect(names).toEqual(expectedNames)
    for (const name of names) {
      const { frontmatter, body } = parseSkill(await readFile(resolve(skillRoot, name, 'SKILL.md'), 'utf8'))
      const description = String(frontmatter.description ?? '').replace(/\s+/gu, ' ').trim()
      expect(frontmatter.name).toBe(name)
      expect(description.length, name).toBeGreaterThan(0)
      expect(description.length, name).toBeLessThanOrEqual(480)
      expect(body.trim().length, name).toBeGreaterThan(0)
      expect(frontmatter).not.toHaveProperty('disableModelInvocation')
      expect(frontmatter).not.toHaveProperty('userInvocable')
      expect(frontmatter['disable-model-invocation'] === true, name)
        .toBe(name === 'spark-steering' || name === 'upsum')
      expect(frontmatter['user-invocable'], name).not.toBe(false)
    }
  })

  it('preserves every adjacent license, Better Skill Creator NOTICE, and no symlinks', async () => {
    for (const name of expectedNames) {
      const license = name === 'better-skill-creator' ? 'LICENSE.txt' : 'LICENSE.md'
      expect((await lstat(resolve(skillRoot, name, license))).isFile(), name).toBe(true)
    }
    expect((await lstat(resolve(skillRoot, 'better-skill-creator', 'NOTICE'))).isFile()).toBe(true)
    await expect(filesBelow(skillRoot)).resolves.not.toHaveLength(0)
  })

  it('contains no prohibited plugin/app/hook surface or packaged historical test corpus', async () => {
    const relativeFiles = (await filesBelow(skillRoot)).map(path => relative(skillRoot, path).replaceAll('\\', '/'))
    expect(relativeFiles.some(path => path.includes('.codex-plugin/'))).toBe(false)
    expect(relativeFiles.some(path => path.includes('.claude-plugin/'))).toBe(false)
    expect(relativeFiles.some(path => /(?:^|\/)hooks(?:\/|$)/u.test(path))).toBe(false)
    expect(relativeFiles.some(path => /(?:^|\/)(?:tests?|fixtures?|eval-viewer|assets)(?:\/|$)/u.test(path))).toBe(false)
  })

  it('allows legacy-host words only in attribution, provenance, exclusion, or negative guidance', async () => {
    const allow = [
      /\/LICENSE\.md$/u,
      /subagent-composition\/references\/provenance\.md$/u,
      /upsum\/scripts\/checks\.py$/u,
      /upsum\/SKILL\.md$/u,
      /better-skill-creator\/scripts\/run_eval\.py$/u,
    ]
    const offenders: string[] = []
    for (const path of await filesBelow(skillRoot)) {
      if (!/\.(?:md|py|txt)$/iu.test(path)) continue
      const relativePath = relative(skillRoot, path).replaceAll('\\', '/')
      const text = await readFile(path, 'utf8')
      if (/(?:Claude Code|claude -p|~\/.claude|~\/.agents|\.codex-plugin|Codex)/iu.test(text)
        && !allow.some(pattern => pattern.test(relativePath))) offenders.push(relativePath)
    }
    expect(offenders).toEqual([])
  })
})

describe('pinned source evidence', () => {
  it('matches every vendored SHA-256 and classifies every reviewed deletion', async () => {
    const lock = JSON.parse(await readFile(resolve(root, 'upstream.lock.json'), 'utf8')) as {
      repository: string
      commit: string
      included: { path: string; sha256: string }[]
      reviewedDeletions: { path: string; sha256: string }[]
    }
    expect(lock.repository).toBe('https://github.com/OpenCnid/dovetail.git')
    expect(lock.commit).toBe('69f89e3322847fb11665980c16598494a9eacca0')
    expect(lock.included).toHaveLength(31)
    expect(lock.reviewedDeletions.length).toBeGreaterThan(0)
    for (const entry of lock.included) {
      const bytes = await readFile(resolve(root, 'vendor', 'dovetail', ...entry.path.split('/')))
      expect(createHash('sha256').update(bytes).digest('hex'), entry.path).toBe(entry.sha256)
    }
  })
})
