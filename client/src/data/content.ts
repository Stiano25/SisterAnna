import type { Category, QuickLink } from '../types'

export const categories: Category[] = [
  {
    id: 'life',
    label: 'Personal life',
    sublabel: 'Her journey',
    iconName: 'Cross'
  },
  {
    id: 'mission',
    label: 'Missions',
    sublabel: 'Ongoing work',
    iconName: 'Compass'
  },
  {
    id: 'visions',
    label: 'Visions',
    sublabel: 'Divine encounters',
    iconName: 'Eye'
  },
  {
    id: 'gallery',
    label: 'Gallery',
    sublabel: 'Photographs',
    iconName: 'Image'
  }
]

export const quickLinks: QuickLink[] = [
  {
    id: 'q1',
    question: 'What were her visions of Jesus like?',
    pageId: 'visions',
    cardId: 'vision-rome'
  },
  {
    id: 'q2',
    question: 'How did she live her vocation?',
    pageId: 'life',
    cardId: 'religious-life'
  },
  {
    id: 'q3',
    question: 'What is happening with her mission today?',
    pageId: 'mission'
  },
  {
    id: 'q4',
    question: 'Where can I see photos of her life?',
    pageId: 'gallery'
  }
]
