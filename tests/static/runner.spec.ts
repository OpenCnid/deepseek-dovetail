import { execFile } from 'node:child_process'
import { access, mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const runner = resolve(process.cwd(), 'dist', 'skills', 'better-skill-creator', 'scripts', 'run_eval.py')

async function fixture(requiredCredentialEnv: string[] = []): Promise<{ root: string; config: string; artifacts: string }> {
  const root = await mkdtemp(resolve(tmpdir(), 'dovetail-runner-'))
  const workspace = resolve(root, 'fixture')
  const artifacts = resolve(root, 'artifacts')
  await mkdir(workspace)
  await writeFile(resolve(workspace, 'task.txt'), 'identical fixture bytes\n')
  const config = resolve(root, 'config.json')
  await writeFile(config, JSON.stringify({
    dshExecutable: process.execPath,
    profile: 'headless', provider: 'test-provider', model: 'test-model', targetSkill: 'prompt-engineering',
    workspaceFixture: workspace, artifactRoot: artifacts, repetitions: 1,
    timeoutSeconds: 10, maxCapturedBytes: 65536, maxArtifactBytes: 1048576,
    requiredCredentialEnv, allowedEnvironment: [],
    cases: [{ id: 'case-one', task: 'Write a bounded template.', graderPrompt: 'Prefer correctness and clarity.' }],
  }, null, 2))
  return { root, config, artifacts }
}

async function installFakeDsh(test: { root: string; config: string }, timeoutSeconds = 10): Promise<void> {
  const fake = resolve(test.root, 'fake-dsh.mjs')
  await writeFile(fake, [
    "import { mkdir, readFile, writeFile } from 'node:fs/promises'",
    "import { join } from 'node:path'",
    "const args = process.argv.slice(2)",
    "const patches = args.flatMap((value, index) => value === '--patch' ? [args[index + 1]] : [])",
    "const patch = await readFile(patches.at(-1), 'utf8')",
    "const rootMatch = /root: '(.*)'/u.exec(patch)",
    "if (!rootMatch) throw new Error('missing session root')",
    "const sessionRoot = rootMatch[1].replaceAll(`''`, `'`)",
    "const task = args.at(-1) ?? ''",
    "const baseline = patch.includes('id: tool-skill')",
    "const grader = task.includes('Judge two anonymous candidate outputs')",
    "const mode = process.env.DOVETAIL_FAKE_MODE ?? ''",
    "if (mode === 'hang-treatment' && task.startsWith('/')) await new Promise(resolve => setTimeout(resolve, 30000))",
    "const messages = []",
    "if (!baseline && !grader) messages.push({ type: 'user/message', seq: 1, data: { source: { kind: 'skill-invocation', name: 'prompt-engineering', form: 'instructions' }, content: [{ type: 'text', text: '<skill_content name=\"prompt-engineering\">fixture</skill_content>' }] } })",
    "if (baseline && mode === 'contaminate') messages.push({ type: 'user/message', seq: 1, data: { source: { kind: 'skill-catalog' }, content: [{ type: 'text', text: '<available_skills>contaminated</available_skills>' }] } })",
    "const reply = grader ? 'TIE: fixture verdict' : `candidate ${process.env.DOVETAIL_TEST_SECRET ?? 'clean'}`",
    "const events = [{ type: 'session', version: 0, id: 'session-fake', createdAt: 1, cwd: process.cwd(), delegationDepth: 0 }, ...messages, { type: 'assistant/message', seq: 2, data: { message: { role: 'assistant', content: [{ type: 'text', text: reply }] }, usage: { inputTokens: 1, outputTokens: 1 } } }, { type: 'turn/end', seq: 3, data: { reason: { kind: 'completed' } } }]",
    "const directory = join(sessionRoot, 'session-fake')",
    "await mkdir(directory, { recursive: true })",
    "await writeFile(join(directory, 'session.jsonl'), events.map(event => JSON.stringify(event)).join('\\n') + '\\n')",
    "process.stdout.write(reply + '\\n')",
    "if (mode === 'fail-grader' && grader) process.exitCode = 9",
  ].join('\n'))
  const config = JSON.parse(await readFile(test.config, 'utf8')) as Record<string, unknown>
  config.dshArguments = [fake]
  config.allowedEnvironment = ['DOVETAIL_FAKE_MODE']
  config.timeoutSeconds = timeoutSeconds
  await writeFile(test.config, JSON.stringify(config))
}

async function onlyRunDirectory(artifacts: string): Promise<string> {
  const names = await readdir(artifacts)
  expect(names).toHaveLength(1)
  const name = names[0]
  if (name === undefined) throw new Error('expected one evaluation run directory')
  return resolve(artifacts, name)
}

describe('DSH paired evaluation runner controls', () => {
  it('plans exact treatment/baseline/grader shapes without credential values', async () => {
    const test = await fixture(['DOVETAIL_TEST_SECRET'])
    const secret = 'do-not-serialize-this-value'
    const { stdout } = await execFileAsync('python', [runner, test.config, '--plan'], {
      env: { ...process.env, DOVETAIL_TEST_SECRET: secret }, maxBuffer: 1024 * 1024,
    })
    const plan = JSON.parse(stdout) as { status: string; runs: number; controls: Record<string, string>; commands: { arm: string; argv: string[] }[] }
    expect(plan.status).toBe('PLAN')
    expect(plan.runs).toBe(3)
    expect(plan.controls).toMatchObject({ treatmentPrefix: '/prompt-engineering', baselineHides: 'tool-skill' })
    expect(plan.commands.map(command => command.arm)).toEqual(['treatment', 'baseline', 'grader'])
    expect(stdout).not.toContain(secret)
    expect(stdout).not.toContain('Write a bounded template.')
  })

  it('self-skips live provider work as UNMEASURED when credentials are absent', async () => {
    const test = await fixture(['DOVETAIL_CREDENTIAL_THAT_DOES_NOT_EXIST'])
    const { stdout } = await execFileAsync('python', [runner, test.config, '--run'], { maxBuffer: 1024 * 1024 })
    expect(JSON.parse(stdout)).toEqual({
      status: 'UNMEASURED',
      reason: 'required credential environment is absent',
      missingEnvironmentNames: ['DOVETAIL_CREDENTIAL_THAT_DOES_NOT_EXIST'],
    })
    await expect(readdir(test.artifacts)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('fails invalid child-count and timeout bounds before executing', async () => {
    const test = await fixture()
    const value = JSON.parse(await readFile(test.config, 'utf8')) as Record<string, unknown>
    value.timeoutSeconds = 3601
    await writeFile(test.config, JSON.stringify(value))
    await expect(execFileAsync('python', [runner, test.config, '--plan']))
      .rejects.toMatchObject({ code: 1 })
  })

  it('writes blinded paired artifacts, redacts credentials, and reveals arm identity only after grading', async () => {
    const test = await fixture(['DOVETAIL_TEST_SECRET'])
    await installFakeDsh(test)
    const secret = 'never-persist-this-secret'
    const { stdout } = await execFileAsync('python', [runner, test.config, '--run'], {
      env: { ...process.env, DOVETAIL_TEST_SECRET: secret }, maxBuffer: 1024 * 1024,
    })
    const result = JSON.parse(stdout) as { status: string; artifactPath: string }
    expect(result.status).toBe('MEASURED')
    const caseDir = resolve(result.artifactPath, 'case-one-01')
    const treatment = JSON.parse(await readFile(resolve(caseDir, 'treatment.json'), 'utf8'))
    const baseline = JSON.parse(await readFile(resolve(caseDir, 'baseline.json'), 'utf8'))
    const gradeInput = JSON.parse(await readFile(resolve(caseDir, 'grade-input.json'), 'utf8'))
    const armMap = JSON.parse(await readFile(resolve(caseDir, 'arm-map.json'), 'utf8'))
    expect(treatment.surfaceChecks).toMatchObject({ targetBodyCount: 1, sawCatalog: false, sawAnySkillContent: true })
    expect(baseline.surfaceChecks).toMatchObject({ targetBodyCount: 0, sawCatalog: false, sawAnySkillContent: false })
    expect(gradeInput.candidates.map((candidate: { position: string }) => candidate.position)).toEqual(['A', 'B'])
    expect(JSON.stringify(gradeInput)).not.toMatch(/treatment|baseline/iu)
    expect(Object.values(armMap).sort()).toEqual(['baseline', 'treatment'])
    const files = await readdir(caseDir)
    for (const file of files) expect(await readFile(resolve(caseDir, file), 'utf8')).not.toContain(secret)
  })

  it('retains FAILED partial evidence and withholds the arm map when the grader fails', async () => {
    const test = await fixture(['DOVETAIL_TEST_SECRET'])
    await installFakeDsh(test)
    await expect(execFileAsync('python', [runner, test.config, '--run'], {
      env: { ...process.env, DOVETAIL_TEST_SECRET: 'fixture-secret', DOVETAIL_FAKE_MODE: 'fail-grader' },
      maxBuffer: 1024 * 1024,
    })).rejects.toMatchObject({ code: 1 })
    const runDir = await onlyRunDirectory(test.artifacts)
    expect(JSON.parse(await readFile(resolve(runDir, 'run.json'), 'utf8'))).toMatchObject({ status: 'FAILED' })
    await expect(access(resolve(runDir, 'case-one-01', 'grader.json'))).resolves.toBeUndefined()
    await expect(access(resolve(runDir, 'case-one-01', 'arm-map.json'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('kills a timed-out arm and records the abort before failing loud', async () => {
    const test = await fixture(['DOVETAIL_TEST_SECRET'])
    await installFakeDsh(test, 1)
    await expect(execFileAsync('python', [runner, test.config, '--run'], {
      env: { ...process.env, DOVETAIL_TEST_SECRET: 'fixture-secret', DOVETAIL_FAKE_MODE: 'hang-treatment' },
      timeout: 10_000, maxBuffer: 1024 * 1024,
    })).rejects.toMatchObject({ code: 1 })
    const runDir = await onlyRunDirectory(test.artifacts)
    const treatment = JSON.parse(await readFile(resolve(runDir, 'case-one-01', 'treatment.json'), 'utf8'))
    expect(treatment.process).toMatchObject({ timedOut: true })
    expect(JSON.parse(await readFile(resolve(runDir, 'run.json'), 'utf8'))).toMatchObject({ status: 'FAILED' })
  })
})
