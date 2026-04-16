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

export const categories: Category[] = [
  { id: 'visions', label: 'Visions', sublabel: 'Divine encounters', iconName: 'Eye' },
  { id: 'life', label: 'Personal life', sublabel: 'Her journey', iconName: 'Cross' },
  { id: 'stigmata', label: 'Stigmata', sublabel: 'Sacred wounds', iconName: 'Droplets' },
  { id: 'miracles', label: 'Miracles', sublabel: 'Divine works', iconName: 'Sparkles' },
  { id: 'book', label: 'Her Book', sublabel: 'Divine teachings', iconName: 'BookOpen' },
  { id: 'mission', label: 'Mission', sublabel: 'Continuing work', iconName: 'Compass' }
]

export const quickLinks: QuickLink[] = [
  { id: 'q1', question: 'What were her visions of Jesus like?', pageId: 'visions', cardId: 'vision-rome' },
  { id: 'q2', question: 'How did she receive the stigmata?', pageId: 'stigmata', cardId: 'stigmata-thursday' },
  { id: 'q3', question: 'What miracles happened at her funeral?', pageId: 'miracles', cardId: 'funeral-host' },
  { id: 'q4', question: 'What is her book about?', pageId: 'book', cardId: 'eucharist-book' },
  { id: 'q5', question: 'How can I support the family?', pageId: 'family-project' }
]

export const allContent: ContentCard[] = [
  // Visions
  {
    id: 'vision-rome',
    pageId: 'visions',
    eyebrow: 'Rome 1987-1988',
    title: 'First Visions of Jesus',
    body: 'During her time in Rome for religious formation, Sister Anna Ali received her first profound visions of Jesus Christ, who spoke to her about the importance of the Eucharist and the need for deeper devotion among the faithful.',
    tag: 'Divine Encounter'
  },
  {
    id: 'vision-eucharist',
    pageId: 'visions',
    eyebrow: 'Ongoing Revelations',
    title: 'Messages about the Eucharist',
    body: 'Jesus repeatedly appeared to her with messages about proper reverence for the Eucharist, the need for adoration, and warnings about sacrilege. These visions formed the basis of her later book.',
    tag: 'Sacred Teaching'
  },
  {
    id: 'vision-passion',
    pageId: 'visions',
    eyebrow: 'Mystical Experience',
    title: 'Sharing in Christ\'s Passion',
    body: 'In her visions, Jesus invited her to share in His passion, which manifested through her weekly stigmata and tears of blood every Thursday for 25 years.',
    tag: 'Mystical Union'
  },

  // Her Life
  {
    id: 'demo-about-memorial',
    pageId: 'life',
    eyebrow: 'How to read this site',
    title: 'About the memorial fields',
    body: 'The small line above the headline is the context line (often a date, place, or theme). The large line is the story title. The rounded badge under the title is the topic tag. This sample card appears on fresh database installs so you can match admin labels to what visitors see.',
    tag: 'Editor sample'
  },
  {
    id: 'birth-kipkelion',
    pageId: 'life',
    eyebrow: 'December 29, 1966',
    title: 'Born Hadija at Kipkelion',
    body: 'Born as Hadija to a Muslim family in Kipkelion, Kenya. Her early life was marked by a mysterious seven-year illness that doctors could not cure, later understood as divine preparation.',
    tag: 'Early Life'
  },
  {
    id: 'seven-year-illness',
    pageId: 'life',
    eyebrow: '1976-1983',
    title: 'The Seven-Year Illness',
    body: 'From age 10 to 17, she suffered from a mysterious illness that baffled medical professionals. This period of suffering prepared her soul for her future mystical experiences.',
    tag: 'Preparation'
  },
  {
    id: 'healing-nairobi',
    pageId: 'life',
    eyebrow: '1983',
    title: 'Miraculous Healing in Nairobi',
    body: 'At age 17, she attended a healing crusade in Nairobi where she experienced complete healing and conversion to Christianity, marking the beginning of her spiritual journey.',
    tag: 'Conversion'
  },
  {
    id: 'pious-union',
    pageId: 'life',
    eyebrow: '1986',
    title: 'Joining the Pious Union',
    body: 'Entered the Pious Union of the Daughters of the Sacred Heart, beginning her formal religious life dedicated to serving God and caring for the poor and marginalized.',
    tag: 'Vocation'
  },
  {
    id: 'rome-formation',
    pageId: 'life',
    eyebrow: '1987-1991',
    title: 'Formation in Rome',
    body: 'Traveled to Rome for religious formation where she made her first profession in 1991. It was during this time that she received her first visions of Jesus.',
    tag: 'Religious Formation'
  },
  {
    id: 'burnt-forest-ministry',
    pageId: 'life',
    eyebrow: '1991-2012',
    title: 'Ministry at Burnt Forest',
    body: 'Returned to Kenya to serve at Burnt Forest, Eldoret, where she dedicated her life to works of mercy, caring for the displaced, and deepening her mystical relationship with Christ.',
    tag: 'Ministry'
  },

  // Stigmata
  {
    id: 'stigmata-thursday',
    pageId: 'stigmata',
    eyebrow: '25 Years Every Thursday',
    title: 'Weekly Tears of Blood',
    body: 'From her first profession until her death, Sister Anna Ali wept tears of blood every Thursday, mystically participating in Christ\'s passion. This phenomenon was witnessed by countless people.',
    tag: 'Sacred Wounds'
  },
  {
    id: 'stigmata-witness',
    pageId: 'stigmata',
    eyebrow: 'Medical Documentation',
    title: 'Witnessed and Documented',
    body: 'Her stigmata was witnessed by fellow religious, medical professionals, and pilgrims. Doctors found no medical explanation for the weekly occurrence of bloody tears.',
    tag: 'Testimony'
  },
  {
    id: 'stigmata-meaning',
    pageId: 'stigmata',
    eyebrow: 'Spiritual Significance',
    title: 'Union with Christ\'s Suffering',
    body: 'The weekly stigmata represented her deep mystical union with Christ\'s passion, offering her suffering for the conversion of sinners and the sanctification of priests.',
    tag: 'Mystical Grace'
  },

  // Miracles
  {
    id: 'funeral-host',
    pageId: 'miracles',
    eyebrow: 'June 6, 2012',
    title: 'The Floating Eucharistic Host',
    body: 'During her funeral Mass, numerous witnesses reported seeing a consecrated Host floating above her casket, a miraculous sign of her special relationship with the Eucharist.',
    tag: 'Funeral Miracle'
  },
  {
    id: 'grave-healings',
    pageId: 'miracles',
    eyebrow: 'Ongoing Since 2012',
    title: 'Healings at Her Grave',
    body: 'Countless pilgrims have reported physical and spiritual healings after visiting her grave at Burnt Forest. These reported miracles are being investigated for her canonization process.',
    tag: 'Intercession'
  },
  {
    id: 'peace-burnt-forest',
    pageId: 'miracles',
    eyebrow: 'Since June 6, 2012',
    title: 'Peace in Burnt Forest',
    body: 'The area of Burnt Forest, previously known for ethnic tensions and violence, has experienced unprecedented peace since the day of her death, attributed to her heavenly intercession.',
    tag: 'Social Miracle'
  },
  {
    id: 'election-violence-shelter',
    pageId: 'miracles',
    eyebrow: '2007-2008',
    title: 'Sheltering the Displaced',
    body: 'During Kenya\'s post-election violence, she fearlessly sheltered displaced families of all ethnic backgrounds, demonstrating Christ\'s love and bringing peace to a troubled region.',
    tag: 'Works of Mercy'
  },

  // Her Book
  {
    id: 'eucharist-book',
    pageId: 'book',
    eyebrow: 'Divine Revelations',
    title: 'On the Eucharist: A Divine Appeal',
    body: 'This book contains the revelations and messages Sister Anna Ali received from Jesus about the Eucharist, proper reverence in worship, and the urgent need for deeper faith among Catholics.',
    tag: 'Sacred Writing'
  },
  {
    id: 'book-teachings',
    pageId: 'book',
    eyebrow: 'Spiritual Guidance',
    title: 'Teachings on Eucharistic Devotion',
    body: 'The book provides practical guidance for deepening one\'s relationship with Christ through the Eucharist, proper preparation for Mass, and living a life of prayer and service.',
    tag: 'Spiritual Direction'
  },
  {
    id: 'book-warnings',
    pageId: 'book',
    eyebrow: 'Prophetic Messages',
    title: 'Warnings About Sacrilege',
    body: 'Jesus warned through her about the growing irreverence toward the Eucharist and called for urgent reform in how the faithful approach the Most Blessed Sacrament.',
    tag: 'Prophetic Call'
  }
]

export const missionCards: MissionCard[] = [
  {
    id: 'canonization',
    pageId: 'mission',
    eyebrow: 'Vatican Process',
    title: 'Canonization Process',
    body: 'The official process for Sister Anna Ali\'s canonization is underway with the Catholic Church. The diocesan phase has been completed, and her cause is now being reviewed in Rome.',
    tag: 'Sainthood',
    status: 'in-progress',
    supportLink: 'Learn more about supporting the cause'
  },
  {
    id: 'shrine-development',
    pageId: 'mission',
    eyebrow: 'Burnt Forest',
    title: 'Shrine Development',
    body: 'Plans are underway to develop a proper shrine at her burial site in Burnt Forest to accommodate the growing number of pilgrims who come seeking her intercession.',
    tag: 'Infrastructure',
    status: 'planned',
    supportLink: 'Support shrine construction'
  },
  {
    id: 'book-distribution',
    pageId: 'mission',
    eyebrow: 'Publishing Ministry',
    title: 'Book Translation & Distribution',
    body: 'Ongoing efforts to translate "On the Eucharist: A Divine Appeal" into multiple languages and distribute it worldwide to spread her Eucharistic devotion.',
    tag: 'Evangelization',
    status: 'ongoing',
    supportLink: 'Help distribute her teachings'
  },
  {
    id: 'medical-mission',
    pageId: 'mission',
    eyebrow: 'Healthcare Ministry',
    title: 'Medical Mission Expansion',
    body: 'Expanding healthcare services in her memory to serve the poor and marginalized communities around Burnt Forest, continuing her works of mercy.',
    tag: 'Healthcare',
    status: 'unfunded',
    supportLink: 'Fund medical missions'
  },
  {
    id: 'youth-formation',
    pageId: 'mission',
    eyebrow: 'Education',
    title: 'Youth Formation Programs',
    body: 'Developing programs to form young people in Eucharistic devotion and the spiritual life, inspired by Sister Anna Ali\'s teachings and example.',
    tag: 'Formation',
    status: 'planned',
    supportLink: 'Support youth programs'
  }
]