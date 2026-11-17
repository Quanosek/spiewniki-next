// ! Keep root spellings, semitone values, notation tables, and accidental sets aligned

const ROOT_TO_SEMITONE: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  // ? B means B-flat while H means B-natural in Central European notation
  B: 10,
  H: 11,
  Cis: 1,
  Dis: 3,
  Eis: 5,
  Fis: 6,
  Gis: 8,
  Ais: 10,
  His: 0,
  Ces: 11,
  Des: 1,
  Es: 3,
  Fes: 4,
  Ges: 6,
  As: 8,
}

// ! Match longer root names first to avoid partial parses
const ROOTS_BY_LENGTH = Object.keys(ROOT_TO_SEMITONE).sort((a, b) => b.length - a.length)

// ! Keep major chords ahead of the minor shortcut
const BODY_RE = /^(?:maj|min|m(?!aj)|dim|aug|sus[24]?|add\d+|\d+|[+\-#b*])*$/

const MINOR_PREFIX_RE = /^(?:min|m(?!aj))/

const isMinorBody = (body: string): boolean => MINOR_PREFIX_RE.test(body)

export type ChordNotation = 'centralEuropean' | 'germanTraditional' | 'angloSaxon'

interface NoteTable {
  sharp: readonly string[]
  flat: readonly string[]
}

// The German variant reuses these notes and converts minor chords separately
const CENTRAL_EUROPEAN_NOTES: NoteTable = {
  sharp: ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'Ais', 'H'],
  flat: ['C', 'Des', 'D', 'Es', 'E', 'F', 'Ges', 'G', 'As', 'A', 'B', 'H'],
}

const ANGLO_SAXON_NOTES: NoteTable = {
  sharp: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'],
  flat: ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'],
}

const NOTES_BY_NOTATION: Record<ChordNotation, NoteTable> = {
  centralEuropean: CENTRAL_EUROPEAN_NOTES,
  germanTraditional: CENTRAL_EUROPEAN_NOTES,
  angloSaxon: ANGLO_SAXON_NOTES,
}

interface ParsedChord {
  root: string
  semitone: number
  body: string
}

const SHARP_ROOTS = new Set(['Cis', 'Dis', 'Fis', 'Gis', 'Ais'])
const FLAT_ROOTS = new Set(['Des', 'Es', 'Ges', 'As', 'B'])

const parseChord = (text: string): ParsedChord | null => {
  for (const root of ROOTS_BY_LENGTH) {
    if (!text.startsWith(root)) continue
    const body = text.slice(root.length)
    if (BODY_RE.test(body)) return { root, semitone: ROOT_TO_SEMITONE[root], body }
  }
  return null
}

const mod12 = (n: number): number => ((n % 12) + 12) % 12

const toMusicalAccidentals = (body: string): string => {
  return body.replace(/#/g, '♯').replace(/b(?=\d)/g, '♭')
}

const renderRoot = (semitone: number, notation: ChordNotation, useSharps: boolean): string => {
  const table = NOTES_BY_NOTATION[notation]
  return useSharps ? table.sharp[semitone] : table.flat[semitone]
}

export interface FormatOptions {
  semitones: number
  useSharps: boolean
  notation: ChordNotation
}

// ? German traditional notation lowercases minor roots and drops the minor marker
const applyGermanMinorConvention = (
  name: string,
  body: string,
  notation: ChordNotation
): { name: string; body: string } => {
  if (notation !== 'germanTraditional' || !isMinorBody(body)) return { name, body }

  return {
    name: name.toLowerCase(),
    body: body.replace(MINOR_PREFIX_RE, ''),
  }
}

const peelBrackets = (chunk: string): { lead: string; core: string; tail: string } => {
  const lead = chunk.match(/^[\[(]*/)![0]
  const tail = chunk.match(/[\])]*$/)![0]
  const core = chunk.slice(lead.length, chunk.length - tail.length)
  return { lead, core, tail }
}

const transposeToken = (chunk: string, opts: FormatOptions): string => {
  const { lead, core, tail } = peelBrackets(chunk)
  if (!core) return chunk

  const parsed = parseChord(core)
  if (!parsed) return chunk

  const newSemitone = mod12(parsed.semitone + opts.semitones)
  const rendered = renderRoot(newSemitone, opts.notation, opts.useSharps)

  const { name, body } = applyGermanMinorConvention(rendered, parsed.body, opts.notation)
  const formattedBody = toMusicalAccidentals(body)

  return lead + name + formattedBody + tail
}

export const transposeChord = (token: string, opts: FormatOptions): string => {
  // ? Slash chords are transposed one root at a time
  if (token.includes('/')) {
    return token
      .split('/')
      .map((part) => transposeToken(part, opts))
      .join('/')
  }
  return transposeToken(token, opts)
}

export const transposeChordLine = (line: string, opts: FormatOptions): string => {
  const tokens: { text: string; start: number }[] = []
  const tokenRegex = /\S+/g
  let match: RegExpExecArray | null
  while ((match = tokenRegex.exec(line)) !== null) {
    tokens.push({ text: match[0], start: match.index })
  }
  if (tokens.length === 0) return line

  let out = ''
  let cursor = 0

  for (let i = 0; i < tokens.length; i++) {
    const { text, start } = tokens[i]
    const transposed = transposeChord(text, opts)

    // ! Keep expanded chords centered without overlapping their neighbors
    const originalCenter = start + (text.length - 1) / 2
    const desiredStart = Math.round(originalCenter - (transposed.length - 1) / 2)

    // ! Start at zero and keep one space between chord tokens
    const minStart = i === 0 ? 0 : cursor + 1
    const newStart = Math.max(minStart, desiredStart)

    if (newStart > cursor) out += ' '.repeat(newStart - cursor)
    out += transposed
    cursor = newStart + transposed.length
  }

  // ! Preserve trailing spaces used for chord alignment
  const last = tokens[tokens.length - 1]
  return out + line.slice(last.start + last.text.length)
}

const collectParsedChords = (lyrics: Record<string, string[]>): ParsedChord[] => {
  const parsedChords: ParsedChord[] = []

  for (const verse of Object.values(lyrics)) {
    for (const line of verse) {
      // ? Period-prefixed lines contain chord data in hymn sources
      if (!line.startsWith('.')) continue

      for (const token of line.slice(1).trim().split(/\s+/)) {
        const core = token.split('/')[0].replace(/[\[(\])]/g, '')
        const parsed = parseChord(core)
        if (parsed) parsedChords.push(parsed)
      }
    }
  }

  return parsedChords
}

export const detectHymnUseSharps = (lyrics: Record<string, string[]>): boolean | null => {
  const parsedChords = collectParsedChords(lyrics)
  if (parsedChords.length === 0) return null

  let sharps = 0
  let flats = 0
  let firstAccidental: 'sharp' | 'flat' | null = null

  for (const chord of parsedChords) {
    if (SHARP_ROOTS.has(chord.root)) {
      sharps++
      if (!firstAccidental) firstAccidental = 'sharp'
      continue
    }

    if (FLAT_ROOTS.has(chord.root)) {
      flats++
      if (!firstAccidental) firstAccidental = 'flat'
    }
  }

  // ? Tied accidental counts use the first accidental encountered
  if (flats > sharps) return false
  if (sharps > flats) return true
  if (firstAccidental === 'flat') return false
  if (firstAccidental === 'sharp') return true
  return null
}

// ? This fallback takes the first parsed chord as the estimated key
export const detectHymnKey = (lyrics: Record<string, string[]>): string | null => {
  const [first] = collectParsedChords(lyrics)
  return first ? first.root + first.body : null
}
