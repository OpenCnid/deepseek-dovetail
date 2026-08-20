/**
 * Package-owned Dovetail skill provider for DeepSeek Harness.
 * @module deepseek-dovetail
 */

import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import * as SkillFileSystem from '@deepseek-ai/dsh-skill-filesystem'

/** Cordis plugin identity used by the bundle row. */
export const name = 'deepseek-dovetail'

/** The host skill registry must exist before the package provider mounts. */
export const inject = ['skills']

/** Absolute installed path supplied to the filesystem provider's bundled rank. */
export const packageSkillRoot = fileURLToPath(new URL('../dist/skills/', import.meta.url))

/**
 * Mount the existing DSH filesystem provider over this package's immutable skill tree.
 * @param ctx - Host context carrying the existing `ctx.skills` registry.
 */
export function apply(ctx: Context): void {
  ctx.plugin(SkillFileSystem, {
    providerName: 'dovetail',
    includeDefaultRoots: false,
    bundledSkillDir: packageSkillRoot,
    watch: false,
  })
}

/** Public Host plugin object for programmatic consumers and import smoke tests. */
export const Host = { name, inject, apply } as const
