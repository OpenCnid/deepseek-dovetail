import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import * as SkillFileSystem from '@deepseek-ai/dsh-skill-filesystem'
import { Host, packageSkillRoot } from '../../src/index.js'

const contexts: Context[] = []

async function treeDigest(root: string): Promise<string> {
  const hash = createHash('sha256')
  async function visit(directory: string, prefix = ''): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true }).catch(error => error?.code === 'ENOENT' ? [] : Promise.reject(error))
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))
    for (const entry of entries) {
      const relative = `${prefix}${entry.name}`
      hash.update(`${entry.isDirectory() ? 'd' : 'f'}:${relative}\0`)
      const target = resolve(directory, entry.name)
      if (entry.isDirectory()) await visit(target, `${relative}/`)
      else if (entry.isFile()) hash.update(await readFile(target))
    }
  }
  await visit(root)
  return hash.digest('hex')
}

async function contextWithRegistry(): Promise<Context> {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(SkillRegistry)
  return ctx
}

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

describe('package provider through the real DSH registry and filesystem provider', () => {
  it('loads all eight package-relative skills and disposes the provider with its parent', async () => {
    const ctx = await contextWithRegistry()
    const fiber = await ctx.plugin(Host)
    const skills = await ctx.skills.list({ cwd: process.cwd() })
    expect(skills.map(skill => skill.name)).toEqual([
      'better-skill-creator', 'hypershot-protocol', 'judge-composition', 'prompt-engineering',
      'self-play', 'spark-steering', 'subagent-composition', 'upsum',
    ])
    for (const summary of skills) {
      expect(summary.provider).toBe('dovetail')
      expect(summary.source).toBe('bundled')
      expect(summary.resourceBase).toEqual({ kind: 'directory', path: resolve(packageSkillRoot, summary.name) })
      const loaded = await ctx.skills.get(summary.name, { cwd: process.cwd() })
      expect(loaded?.content.trim().length, summary.name).toBeGreaterThan(0)
    }
    await fiber.dispose()
    await expect(ctx.skills.list({ cwd: process.cwd() })).resolves.toEqual([])
  })

  it('fails a duplicate dovetail provider registration', async () => {
    const ctx = await contextWithRegistry()
    await ctx.plugin(Host)
    const duplicate = ctx.plugin(SkillFileSystem, {
      providerName: 'dovetail', includeDefaultRoots: false, bundledSkillDir: packageSkillRoot, watch: false,
    })
    await expect(duplicate.await()).rejects.toThrow(/provider.*dovetail|dovetail.*provider/iu)
  })

  it('preserves project precedence and does not write project or user skill homes', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'dovetail-precedence-'))
    const projectSkill = resolve(root, '.dsh', 'skills', 'prompt-engineering')
    const dshHome = resolve(root, 'home-dsh')
    const agentsHome = resolve(root, 'home-agents')
    const userSkill = resolve(dshHome, 'skills', 'prompt-engineering')
    const otherWorkspace = resolve(root, 'other-workspace')
    await mkdir(projectSkill, { recursive: true })
    await mkdir(userSkill, { recursive: true })
    await mkdir(otherWorkspace)
    await writeFile(resolve(projectSkill, 'SKILL.md'), [
      '---', 'name: prompt-engineering', 'description: Project override.', '---', '', 'PROJECT_SENTINEL', '',
    ].join('\n'))
    await writeFile(resolve(userSkill, 'SKILL.md'), [
      '---', 'name: prompt-engineering', 'description: User override.', '---', '', 'USER_SENTINEL', '',
    ].join('\n'))
    const before = await treeDigest(root)
    const ctx = await contextWithRegistry()
    await ctx.plugin(Host)
    await ctx.plugin(SkillFileSystem, {
      providerName: 'test-local', includeDefaultRoots: true, dshHome, agentsHome, watch: false,
    })
    const summary = (await ctx.skills.list({ cwd: root })).find(skill => skill.name === 'prompt-engineering')
    expect(summary?.source).toBe('project-dsh')
    expect(summary?.provider).toBe('test-local')
    expect((await ctx.skills.get('prompt-engineering', { cwd: root }))?.content).toContain('PROJECT_SENTINEL')
    const userSummary = (await ctx.skills.list({ cwd: otherWorkspace })).find(skill => skill.name === 'prompt-engineering')
    expect(userSummary).toMatchObject({ source: 'user-dsh', provider: 'test-local' })
    expect((await ctx.skills.get('prompt-engineering', { cwd: otherWorkspace }))?.content).toContain('USER_SENTINEL')
    expect(await treeDigest(root)).toBe(before)
    await expect(readFile(resolve(agentsHome, 'skills', 'prompt-engineering', 'SKILL.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
