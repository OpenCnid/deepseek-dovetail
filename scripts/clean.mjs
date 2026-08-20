import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { repositoryRoot } from './paths.mjs'

for (const name of ['lib', 'dist', 'coverage']) {
  await rm(resolve(repositoryRoot, name), { recursive: true, force: true })
}
