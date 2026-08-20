import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

const exactRc7 = [
  '@deepseek-ai/dsh-attachment',
  '@deepseek-ai/dsh-brand',
  '@deepseek-ai/dsh-fs',
  '@deepseek-ai/dsh-home-paths',
  '@deepseek-ai/dsh-invariants',
  '@deepseek-ai/dsh-llm',
  '@deepseek-ai/dsh-sandbox',
  '@deepseek-ai/dsh-scope',
  '@deepseek-ai/dsh-session',
  '@deepseek-ai/dsh-skill',
  '@deepseek-ai/dsh-skill-filesystem',
  '@deepseek-ai/dsh-timeout',
  '@deepseek-ai/dsh-typert-protocol',
]

describe('standalone private DSH package contract', () => {
  it('pins only registry dependencies and the exact public provider closure', async () => {
    const manifest = JSON.parse(await readFile(resolve('package.json'), 'utf8')) as Record<string, any>
    expect(manifest).toMatchObject({
      name: 'deepseek-dovetail', private: true, type: 'module',
      main: './lib/index.js', types: './lib/types/index.d.ts',
      license: 'SEE LICENSE IN THIRD_PARTY_NOTICES.md',
      engines: { node: '^22.19.0 || >=24' },
      packageManager: 'pnpm@11.19.0',
      dsh: { bundle: { patch: './cordis.patch.yml' } },
    })
    expect(manifest.dependencies['@deepseek-ai/cordis']).toBe('4.0.1')
    for (const name of exactRc7) expect(manifest.dependencies[name], name).toBe('0.1.0-rc.7')
    for (const dependencies of [manifest.dependencies, manifest.devDependencies]) {
      for (const specifier of Object.values(dependencies)) {
        expect(String(specifier)).not.toMatch(/^(?:file:|link:|workspace:|git(?:\+|:)|https?:)|^(?:[A-Za-z]:[\\/]|\/)/u)
      }
    }
  })

  it('ships one DSH row and no Codex, MCP, app, marketplace, or hook manifest', async () => {
    const patch = parse(await readFile(resolve('cordis.patch.yml'), 'utf8'))
    expect(patch).toEqual([{ insert: [{ id: 'deepseek-dovetail', name: 'deepseek-dovetail' }] }])
    for (const relative of ['.codex-plugin/plugin.json', 'marketplace.json', 'mcp.json', 'hooks/hooks.json']) {
      await expect(access(resolve(relative))).rejects.toMatchObject({ code: 'ENOENT' })
    }
    const source = await readFile(resolve('src', 'index.ts'), 'utf8')
    expect(source).toContain("providerName: 'dovetail'")
    expect(source).toContain('includeDefaultRoots: false')
    expect(source).toContain('watch: false')
    expect(source).toContain("new URL('../dist/skills/', import.meta.url)")
    expect(source).not.toMatch(/(?:fetch\s*\(|https?:|child_process|execFile|spawn\s*\(|homedir\s*\()/u)
  })
})
