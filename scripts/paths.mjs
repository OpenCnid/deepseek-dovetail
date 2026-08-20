import { lstat, realpath } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function assertRelativePath(value, label = 'path') {
  if (typeof value !== 'string' || value === '' || value.includes('\0')) {
    throw new Error(`${label} must be a non-empty path string`)
  }
  const normalized = value.replaceAll('\\', '/')
  if (normalized.startsWith('/') || /^[A-Za-z]:\//u.test(normalized)) {
    throw new Error(`${label} must be relative: ${value}`)
  }
  if (normalized.split('/').some(segment => segment === '..' || segment === '')) {
    throw new Error(`${label} contains traversal or an empty segment: ${value}`)
  }
  return normalized
}

export function resolveInside(root, relativePath, label = 'path') {
  const normalized = assertRelativePath(relativePath, label)
  const absolute = resolve(root, ...normalized.split('/'))
  const rel = relative(resolve(root), absolute)
  if (rel === '..' || rel.startsWith(`..${sep}`) || rel === '') {
    if (rel !== '') throw new Error(`${label} escapes its root: ${relativePath}`)
  }
  return absolute
}

export async function assertNoSymlink(path, label = path) {
  const info = await lstat(path)
  if (info.isSymbolicLink()) throw new Error(`${label} must not be a symlink`)
  return info
}

export async function assertRealpathInside(root, path, label = path) {
  const [realRoot, realPath] = await Promise.all([realpath(root), realpath(path)])
  const rel = relative(realRoot, realPath)
  if (rel === '..' || rel.startsWith(`..${sep}`)) throw new Error(`${label} resolves outside ${root}`)
}
