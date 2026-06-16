export function publicAssetPath(path: string): string {
  const basePath = import.meta.env.BASE_URL || '/'
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`
  const normalizedPath = path.replace(/^\/+/, '')

  return `${normalizedBasePath}${normalizedPath}`
}
