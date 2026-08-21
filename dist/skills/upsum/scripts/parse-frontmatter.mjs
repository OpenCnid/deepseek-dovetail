#!/usr/bin/env node

import process from 'node:process'
import { parseDocument } from 'yaml'

const MAX_INPUT_BYTES = 20 * 1024 * 1024
const MAX_DOCUMENTS = 10_000

const chunks = []
let bytes = 0
for await (const chunk of process.stdin) {
  bytes += chunk.length
  if (bytes > MAX_INPUT_BYTES) throw new Error(`frontmatter batch exceeds ${MAX_INPUT_BYTES} bytes`)
  chunks.push(chunk)
}

const input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
if (!Array.isArray(input) || input.length > MAX_DOCUMENTS) {
  throw new Error(`frontmatter batch must be an array of at most ${MAX_DOCUMENTS} strings`)
}

const parsed = input.map((source) => {
  if (typeof source !== 'string') return { ok: false, error: 'frontmatter source is not a string' }
  const document = parseDocument(source, {
    intAsBigInt: false,
    prettyErrors: false,
    strict: true,
    uniqueKeys: true,
  })
  const error = document.errors[0]
  if (error !== undefined) return { ok: false, error: String(error.message).split(/\r?\n/u)[0] }
  try {
    return { ok: true, data: document.toJS({ maxAliasCount: 100 }) }
  }
  catch (conversionError) {
    return { ok: false, error: String(conversionError).split(/\r?\n/u)[0] }
  }
})

process.stdout.write(`${JSON.stringify(parsed)}\n`)
