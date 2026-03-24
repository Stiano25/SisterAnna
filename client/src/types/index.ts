export interface ContentCard {
  id: string
  pageId: string
  eyebrow: string
  title: string
  body: string
  tag: string
}

export interface Category {
  id: string
  label: string
  sublabel: string
  iconName: string
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

export type PageId =
  | 'home'
  | 'visions'
  | 'life'
  | 'mission'
  | 'gallery'
  | 'search'
