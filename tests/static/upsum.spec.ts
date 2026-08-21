import { execFile } from 'node:child_process'
import { access, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const checks = resolve('dist', 'skills', 'upsum', 'scripts', 'checks.py')

async function git(cwd: string, ...args: string[]): Promise<void> {
  await execFileAsync('git', args, { cwd, maxBuffer: 1024 * 1024 })
}

async function measuredExit(root: string, isolatedPython = false): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const result = await execFileAsync('python', [...(isolatedPython ? ['-S'] : []), checks, root], { maxBuffer: 1024 * 1024 })
    return { code: 0, stdout: result.stdout, stderr: result.stderr }
  }
  catch (error) {
    const result = error as { code?: number; stdout?: string; stderr?: string }
    return { code: result.code ?? -1, stdout: result.stdout ?? '', stderr: result.stderr ?? '' }
  }
}

async function gitFixture(): Promise<string> {
  const container = await mkdtemp(resolve(tmpdir(), 'dovetail-upsum-'))
  const root = resolve(container, 'work')
  const remote = resolve(container, 'remote.git')
  await mkdir(resolve(root, 'skills', 'demo'), { recursive: true })
  await writeFile(resolve(root, 'README.md'), '# Fixture\n')
  await writeFile(resolve(root, 'skills', 'demo', 'SKILL.md'), [
    '---', 'name: demo', 'description: A complete test skill.', '---', '', '# Demo', '',
  ].join('\n'))
  await writeFile(resolve(root, 'skills', 'demo', 'LICENSE.md'), 'fixture license\n')
  await git(root, 'init', '-b', 'main')
  await git(root, 'config', 'user.name', 'Dovetail Test')
  await git(root, 'config', 'user.email', 'dovetail-test@example.invalid')
  await git(root, 'add', '.')
  await git(root, 'commit', '-m', 'fixture')
  await git(container, 'init', '--bare', remote)
  await git(root, 'remote', 'add', 'origin', remote)
  await git(root, 'push', '-u', 'origin', 'main')
  return root
}

describe('package-relative upsum checker', () => {
  it('requires an explicit target and exposes help without inspecting a default home', async () => {
    const help = await execFileAsync('python', [checks, '--help'], { maxBuffer: 1024 * 1024 })
    expect(help.stdout).toContain('TARGET_WORKSPACE')
    await expect(execFileAsync('python', [checks], { maxBuffer: 1024 * 1024 }))
      .rejects.toMatchObject({ code: 2 })
  })

  it('keeps findings separate from partial measurement and never creates close records', async () => {
    const root = await gitFixture()
    const clean = await measuredExit(root)
    expect(clean.code).toBe(1)
    expect(clean.stdout).toContain('0 finding(s); 4/4 checks ran.')
    expect(clean.stdout).toContain('Partially blind: repository state')
    await writeFile(resolve(root, 'README.md'), '# Fixture\n\nRule 7\n')
    const dirty = await measuredExit(root)
    expect(dirty.code).toBe(1)
    expect(dirty.stdout).toMatch(/[1-9][0-9]* finding\(s\); 4\/4 checks ran\./u)
    expect(dirty.stdout).not.toContain('UNMEASURED:')
    await expect(access(resolve(root, '.upsum'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('parses DSH YAML through the packaged Node dependency without Python site packages', async () => {
    const root = await gitFixture()
    const measured = await measuredExit(root, true)
    expect(measured.code).toBe(1)
    expect(measured.stdout).toContain('DSH skill health: clean over 1 file(s)')
    expect(measured.stdout).not.toContain('PyYAML')
    expect(measured.stdout).not.toContain('UNMEASURED: DSH skill health')
  })
})
