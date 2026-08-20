import { createHash } from 'node:crypto'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { parse } from 'yaml'

const PACKAGE_SKILLS = [
  'better-skill-creator',
  'hypershot-protocol',
  'judge-composition',
  'prompt-engineering',
  'self-play',
  'spark-steering',
  'subagent-composition',
  'upsum',
]
const MODEL_SKILLS = PACKAGE_SKILLS.filter(name => name !== 'spark-steering' && name !== 'upsum')

function fail(message) {
  throw new Error(`keyless snapshot verification failed: ${message}`)
}

function parseArgs(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) fail(`invalid argument near ${flag ?? '<end>'}`)
    values.set(flag.slice(2), path.resolve(value))
  }
  for (const name of ['catalog', 'upsum', 'spark', 'baseline', 'self-play', 'out']) {
    if (!values.has(name)) fail(`missing --${name}`)
  }
  return Object.fromEntries(values)
}

async function filesBelow(root, basename) {
  const found = []
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const candidate = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) fail(`symlink in evidence root: ${candidate}`)
      if (entry.isDirectory()) await visit(candidate)
      else if (entry.isFile() && entry.name === basename) found.push(candidate)
    }
  }
  await visit(root)
  return found.sort()
}

async function loadCase(root) {
  const files = await filesBelow(root, 'session.jsonl')
  if (files.length === 0) fail(`no session.jsonl under ${root}`)
  const sessions = []
  for (const file of files) {
    const bytes = await readFile(file)
    const lines = bytes.toString('utf8').split(/\r?\n/u).filter(Boolean)
    const events = lines.map((line, index) => {
      try {
        return JSON.parse(line)
      }
      catch (error) {
        fail(`${file}:${index + 1} is not JSON: ${error.message}`)
      }
    })
    const header = events[0]
    if (header?.type !== 'session') fail(`${file} has no session header`)
    sessions.push({ file, bytes, header, events })
  }
  return sessions
}

function userMessages(session) {
  return session.events.filter(event => event.type === 'user/message').map(event => ({
    source: event.data.source,
    text: event.data.content?.filter(block => block.type === 'text').map(block => block.text).join('\n') ?? '',
  }))
}

function messagesBySource(sessions, kind) {
  return sessions.flatMap(userMessages).filter(message => message.source?.kind === kind)
}

function onlyRoot(sessions, label) {
  const roots = sessions.filter(session => session.header.delegationDepth === 0)
  if (roots.length !== 1) fail(`${label} expected one root session, found ${roots.length}`)
  return roots[0]
}

async function expectedDescriptions() {
  const result = new Map()
  for (const name of PACKAGE_SKILLS) {
    const skillPath = path.resolve('dist', 'skills', name, 'SKILL.md')
    const text = await readFile(skillPath, 'utf8')
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(text)
    if (!match) fail(`missing frontmatter in ${skillPath}`)
    const data = parse(match[1])
    result.set(name, data.description)
  }
  return result
}

function hash(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function evidenceFiles(sessions) {
  return sessions.map(session => ({
    relativePath: path.relative(process.cwd(), session.file).split(path.sep).join('/'),
    bytes: session.bytes.length,
    sha256: hash(session.bytes),
    delegationDepth: session.header.delegationDepth,
  }))
}

function verifyExplicit(caseName, sessions) {
  const root = onlyRoot(sessions, caseName)
  const invocations = messagesBySource([root], 'skill-invocation')
  if (invocations.length !== 1) fail(`${caseName} expected one skill-invocation message, found ${invocations.length}`)
  const invocation = invocations[0]
  if (invocation.source.name !== caseName || invocation.source.form !== 'instructions') {
    fail(`${caseName} invocation source is not canonical DSH skill-invocation metadata`)
  }
  const tag = `<skill_content name="${caseName}">`
  if ((invocation.text.match(new RegExp(tag, 'gu')) ?? []).length !== 1) fail(`${caseName} body was not injected exactly once`)
  const normalized = invocation.text.replaceAll('\\', '/')
  const suffix = `/node_modules/deepseek-dovetail/dist/skills/${caseName}`
  if (!normalized.includes(suffix)) fail(`${caseName} package resource base is not tarball-relative`)
  if (root.events.some(event => event.type === 'tool/call' && event.data?.name === 'skill')) {
    fail(`${caseName} called lowercase skill after explicit injection`)
  }
  return { bodyBytes: Buffer.byteLength(invocation.text), resourceSuffix: suffix }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const [catalog, upsum, spark, baseline, selfPlay] = await Promise.all([
    loadCase(args.catalog),
    loadCase(args.upsum),
    loadCase(args.spark),
    loadCase(args.baseline),
    loadCase(args['self-play']),
  ])
  const descriptions = await expectedDescriptions()

  const catalogRoot = onlyRoot(catalog, 'catalog')
  const catalogMessages = messagesBySource([catalogRoot], 'skill-catalog')
  if (catalogMessages.length !== 1) fail(`catalog expected one DSH skill-catalog message, found ${catalogMessages.length}`)
  const catalogEntries = catalogMessages[0].source.entries
  if (!Array.isArray(catalogEntries)) fail('catalog source metadata does not expose entries')
  const byName = new Map(catalogEntries.map(entry => [entry.name, entry.description]))
  for (const name of MODEL_SKILLS) {
    if (byName.get(name) !== descriptions.get(name)) fail(`${name} catalog description is absent or altered`)
  }
  for (const name of ['spark-steering', 'upsum']) {
    if (byName.has(name)) fail(`${name} leaked into the model catalog`)
  }

  const baselineRoot = onlyRoot(baseline, 'baseline')
  const baselineText = baselineRoot.bytes.toString('utf8')
  if (messagesBySource([baselineRoot], 'skill-catalog').length !== 0) fail('baseline retained the skill catalog consumer')
  if (messagesBySource([baselineRoot], 'skill-invocation').length !== 0) fail('baseline retained explicit skill injection')
  if (baselineText.includes('<available_skills>') || baselineText.includes('<skill_content name=')) {
    fail('baseline request contains catalog or skill body bytes')
  }

  const explicit = {
    upsum: verifyExplicit('upsum', upsum),
    'spark-steering': verifyExplicit('spark-steering', spark),
  }

  const selfRoot = onlyRoot(selfPlay, 'self-play')
  const children = selfPlay.filter(session => session.header.delegationDepth === 1)
  if (children.length !== 1) fail(`self-play expected one cold child, found ${children.length}`)
  const calls = selfRoot.events.filter(event => event.type === 'tool/call')
  const coldCall = calls.find(event => event.data?.name === 'subagent')
  if (!coldCall) fail('self-play did not call the cold subagent tool')
  if (calls.some(event => event.data?.name === 'subagent_fork')) fail('self-play substituted inherited subagent_fork')
  const callArgs = JSON.parse(coldCall.data.arguments)
  if (callArgs.run_in_background !== false) fail('self-play cold child was not a foreground call')
  if (String(callArgs.prompt).includes('SNAPSHOT_SELF_PLAY') || String(callArgs.prompt).includes('/self-play')) {
    fail('self-play leaked the parent marker or invocation into the cold prompt')
  }
  const childText = children[0].bytes.toString('utf8')
  if (childText.includes('SNAPSHOT_SELF_PLAY') || childText.includes('/self-play')) {
    fail('cold child inherited the parent marker or explicit invocation')
  }
  const descriptor = children[0].events.find(event => event.type === 'subagent/descriptor')
  if (descriptor?.data?.provider !== 'spawn' || descriptor.data.mode !== 'one-shot') {
    fail('cold child descriptor is not DSH spawn/one-shot')
  }
  const settled = selfRoot.events.some(event => event.type === 'tool/result'
    && event.data?.message?.content?.some(block => block.type === 'tool-result' && block.isError === false))
  if (!settled) fail('foreground cold child did not settle into a tool result')

  const output = {
    schemaVersion: 1,
    result: 'PASS',
    scope: 'keyless DSH assembly and routing; not behavioral effectiveness',
    modelCatalog: {
      packageEntries: MODEL_SKILLS.map(name => ({ name, description: descriptions.get(name) })),
      explicitOnlyAbsent: ['spark-steering', 'upsum'],
      totalHostCatalogEntries: catalogEntries.length,
    },
    humanInvocation: explicit,
    baseline: { catalogMessages: 0, skillInvocations: 0, skillMarkupOccurrences: 0 },
    coldSubagent: {
      tool: 'subagent',
      provider: 'spawn',
      mode: 'one-shot',
      runInBackground: false,
      inheritedParentMarker: false,
      settled: true,
    },
    rawEvidence: {
      catalog: evidenceFiles(catalog),
      upsum: evidenceFiles(upsum),
      spark: evidenceFiles(spark),
      baseline: evidenceFiles(baseline),
      selfPlay: evidenceFiles(selfPlay),
    },
  }
  await stat(path.dirname(args.out))
  await writeFile(args.out, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  console.log(`keyless DSH snapshot PASS: ${path.relative(process.cwd(), args.out)}`)
}

await main()
