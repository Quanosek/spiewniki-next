import type { ParsedUrlQuery } from 'querystring'

export function getQueryParam(query: ParsedUrlQuery, key: string): string | undefined {
  const value = query[key]
  if (Array.isArray(value)) return value[0]
  return value
}
