export const TRANSLATION_TONES = [
  {
    value: 'literal',
    label: 'Literal Word-for-Word',
    description:
      'Preserves the original structure and phrasing for accuracy and scholarly analysis, even if it sacrifices readability.',
  },
  {
    value: 'tone-preserving',
    label: 'Tone-Preserving',
    description:
      'Retains the original tone, style, and emotional nuance, essential for conveying the intent of the ancient author.',
  },
  {
    value: 'historical',
    label: 'Historical/Classic',
    description:
      'Adopts language that reflects the era or context of the original text, keeping its authentic feel.',
  },
  {
    value: 'simplified',
    label: 'Simplified',
    description:
      'Makes complex or archaic language accessible to modern readers without losing core meaning.',
  },
  {
    value: 'annotated',
    label: 'Annotated',
    description:
      'Combines a direct translation with explanatory notes to provide context about historical, cultural, or linguistic elements.',
  },
] as const;

export const CHUNK_SIZE = 2000;
export const BATCH_SIZE = 10; 