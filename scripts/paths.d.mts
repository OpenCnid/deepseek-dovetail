import type { Stats } from 'node:fs'

export const repositoryRoot: string
export function assertRelativePath(value: unknown, label?: string): string
export function resolveInside(root: string, relativePath: string, label?: string): string
export function assertNoSymlink(path: string, label?: string): Promise<Stats>
export function assertRealpathInside(root: string, path: string, label?: string): Promise<void>
