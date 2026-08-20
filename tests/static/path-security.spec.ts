import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'
import { assertNoSymlink, assertRealpathInside, assertRelativePath, resolveInside } from '../../scripts/paths.mjs'

const execFileAsync = promisify(execFile)

describe('source and resource path containment', () => {
  it('rejects absolute, empty-segment, and traversal source paths', () => {
    for (const candidate of ['', '../escape', 'safe/../escape', '/absolute', 'C:\\absolute', 'safe//file']) {
      expect(() => assertRelativePath(candidate)).toThrow()
    }
    expect(resolveInside(resolve('fixture-root'), 'skills/demo/SKILL.md'))
      .toBe(resolve('fixture-root', 'skills', 'demo', 'SKILL.md'))
  })

  it('rejects a symlink and a realpath escape', async () => {
    const container = await mkdtemp(resolve(tmpdir(), 'dovetail-path-'))
    const root = resolve(container, 'root')
    const outside = resolve(container, 'outside.txt')
    const link = resolve(root, 'link.txt')
    await mkdir(root)
    await writeFile(outside, 'outside\n')
    await symlink(outside, link, 'file')
    await expect(assertNoSymlink(link)).rejects.toThrow(/symlink/iu)
    await expect(assertRealpathInside(root, link)).rejects.toThrow(/outside/iu)
  })

  it('makes the packaged validator reject an existing relative-resource escape', async () => {
    const container = await mkdtemp(resolve(tmpdir(), 'dovetail-resource-'))
    const skill = resolve(container, 'nested', 'demo')
    await mkdir(skill, { recursive: true })
    await writeFile(resolve(container, 'escape.md'), 'outside\n')
    await writeFile(resolve(skill, 'SKILL.md'), [
      '---', 'name: demo', 'description: Escape fixture.', '---', '',
      '# Demo', '', '[outside](../../escape.md)', '',
    ].join('\n'))
    const validator = resolve('dist', 'skills', 'better-skill-creator', 'scripts', 'quick_validate.py')
    await expect(execFileAsync('python', [validator, skill, '--json'], { maxBuffer: 1024 * 1024 }))
      .rejects.toMatchObject({ code: 1 })
  })
})
