export interface ContentCard {
  id: string
  pageId: string
  eyebrow: string
  title: string
  body: string
  tag: string
  // When stored in Neon, story content can be a sequence of blocks.
  // We keep `body` for backwards compatibility (topic cards preview).
  blocks?: ContentBlock[]
  videoUrl?: string
  eventDate?: string
  recordingUrl?: string
  thumbnailImageId?: string
}

export type ContentBlock =
  /**
   * Text blocks support inline links and lightweight formatting:
   * `[label](https://…)`, `**bold**`, `*italic*`, `==highlight==`, heading lines like `# Title`.
   */
  | { type: 'text'; value: string; align?: 'left' | 'center' | 'right' }
  | { type: 'image'; imageId: string }

export interface Category {
  id: string
  label: string
  sublabel: string
  iconName: string
  /** Present when loaded from API (admin / DB). */
  sortOrder?: number
  /** Optional home grid card background (CSS color). */
  cardColor?: string
  /** Optional home grid title + subtitle color (CSS color). */
  textColor?: string
}

export interface QuickLink {
  id: string
  question: string
  pageId: string
  cardId?: string
}

export interface MissionCard extends ContentCard {
  status: 'in-progress' | 'unfunded' | 'ongoing' | 'planned'
  supportLink?: string
}

/** Any route id (known pages + dynamic section ids from the database). */
export type PageId = string
