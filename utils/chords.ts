// =============================================================================
// Section 1 — Input vocabulary
// =============================================================================
//
// All hymn source data is written in full Polish / Central European notation:
// spelled-out roots (Cis, Des, Es, As, B = B♭, H = B♮) and bare letters for
// the seven naturals. There is no `C#` / `Bb` syntax on input, so the parser
// only has to recognize these spellings.

const ROOT_TO_SEMITONE: Record<string, number> = {
  // Naturals
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 10, // B♭ in this convention
  H: 11, // B♮ in this convention
  // Sharpened roots (Polish `-is`)
  Cis: 1,
  Dis: 3,
  Eis: 5,
  Fis: 6,
  Gis: 8,
  Ais: 10,
  His: 0,
  // Flattened roots (Polish `-es` / shortened forms)
  Ces: 11,
  Des: 1,
  Es: 3,
  Fes: 4,
  Ges: 6,
  As: 8,
}

// Try the longest spelling first so e.g. `Cis` wins over `C`.
const ROOTS_BY_LENGTH = Object.keys(ROOT_TO_SEMITONE).sort((a, b) => b.length - a.length)

// =============================================================================
// Section 2 — Chord body grammar (everything that follows the root)
// =============================================================================

// Recognized body fragments. Order matters only for the `m(?!aj)` shortcut so
// that a bare `m` cannot eat the leading letter of `maj`.
const BODY_RE = /^(?:maj|min|m(?!aj)|dim|aug|sus[24]?|add\d+|\d+|[+\-#b*])*$/

// Leading minor marker: spelled-out `min` or bare `m` (but not `maj`).
const MINOR_PREFIX_RE = /^(?:min|m(?!aj))/

const isMinorBody = (body: string): boolean => MINOR_PREFIX_RE.test(body)

// =============================================================================
// Section 3 — Output tables (one row per notation × accidental preference)
// =============================================================================

export type ChordNotation = 'centralEuropean' | 'germanTraditional' | 'angloSaxon'

interface NoteTable {
  sharp: readonly string[]
  flat: readonly string[]
}

// Polish / classical German spelling — shared by both `centralEuropean` and
// `germanTraditional`. The German variant differs only in minor-chord handling
// (see `applyGermanMinorConvention` below).
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

// =============================================================================
// Section 4 — Parsing: split a chord text into root + body
// =============================================================================

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

// =============================================================================
// Section 5 — Rendering: turn a (transposed) semitone back into a chord text
// =============================================================================

const mod12 = (n: number): number => ((n % 12) + 12) % 12

const toMusicalAccidentals = (body: string): string => {
  // Accidentals in chord bodies are written as ASCII in source data
  // (e.g. #11, b9). Render them with musical symbols.
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

// `germanTraditional` writes minor chords with a lowercase root and drops the
// minor marker (`m` or `min`) — e.g. `Am → a`, `Amin7 → a7`, `Fism → fis`.
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

// =============================================================================
// Section 6 — Public API: tokens, slash chords, whole lines, key detection
// =============================================================================

const peelBrackets = (chunk: string): { lead: string; core: string; tail: string } => {
  const lead = chunk.match(/^[\[(]*/)![0]
  const tail = chunk.match(/[\])]*$/)![0]
  const core = chunk.slice(lead.length, chunk.length - tail.length)
  return { lead, core, tail }
}

const transposeToken = (chunk: string, opts: FormatOptions): string => {
  // 1. Strip any surrounding `[` / `(` brackets so they survive the rewrite.
  const { lead, core, tail } = peelBrackets(chunk)
  if (!core) return chunk

  // 2. Parse the core into root + body, or bail out on non-chords.
  const parsed = parseChord(core)
  if (!parsed) return chunk

  // 3. Shift by `semitones` and render the new root in the chosen notation.
  const newSemitone = mod12(parsed.semitone + opts.semitones)
  const rendered = renderRoot(newSemitone, opts.notation, opts.useSharps)

  // 4. Apply notation-specific tweaks (currently: German minor convention).
  const { name, body } = applyGermanMinorConvention(rendered, parsed.body, opts.notation)
  const formattedBody = toMusicalAccidentals(body)

  // 5. Reassemble with the original brackets.
  return lead + name + formattedBody + tail
}

export const transposeChord = (token: string, opts: FormatOptions): string => {
  // Slash chords (e.g. `C/G`) — transpose both halves independently.
  if (token.includes('/')) {
    return token
      .split('/')
      .map((part) => transposeToken(part, opts))
      .join('/')
  }
  return transposeToken(token, opts)
}

export const transposeChordLine = (line: string, opts: FormatOptions): string => {
  // 1. Find every chord token together with its original column position.
  const tokens: { text: string; start: number }[] = []
  const tokenRegex = /\S+/g
  let match: RegExpExecArray | null
  while ((match = tokenRegex.exec(line)) !== null) {
    tokens.push({ text: match[0], start: match.index })
  }
  if (tokens.length === 0) return line

  // 2. Rewrite each token, centring it around the midpoint of the original
  //    chord. Guarantees: at least one space between chords, no negative
  //    columns. When two centred chords would collide, the right-hand chord
  //    slides further right (so growth always pushes outward, never overlaps).
  let out = ''
  let cursor = 0

  for (let i = 0; i < tokens.length; i++) {
    const { text, start } = tokens[i]
    const transposed = transposeChord(text, opts)

    const originalCenter = start + (text.length - 1) / 2
    const desiredStart = Math.round(originalCenter - (transposed.length - 1) / 2)

    // Minimum column: keep at least one space gap after the previous token
    // (the very first token may start at column 0).
    const minStart = i === 0 ? 0 : cursor + 1
    const newStart = Math.max(minStart, desiredStart)

    if (newStart > cursor) out += ' '.repeat(newStart - cursor)
    out += transposed
    cursor = newStart + transposed.length
  }

  // 3. Preserve any whitespace that followed the last chord in the source line.
  const last = tokens[tokens.length - 1]
  return out + line.slice(last.start + last.text.length)
}

const collectParsedChords = (lyrics: Record<string, string[]>): ParsedChord[] => {
  const parsedChords: ParsedChord[] = []

  for (const verse of Object.values(lyrics)) {
    for (const line of verse) {
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

  if (flats > sharps) return false
  if (sharps > flats) return true
  if (firstAccidental === 'flat') return false
  if (firstAccidental === 'sharp') return true
  return null
}

export const detectHymnKey = (lyrics: Record<string, string[]>): string | null => {
  const [first] = collectParsedChords(lyrics)
  return first ? first.root + first.body : null
}
