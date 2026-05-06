# Sister Anna Ali - Legacy & Memorial Website

A full-stack memorial website for Sister Anna Ali (1966-2012), a Catholic religious sister from Kenya known for her stigmata, visions of Jesus, and works of mercy at Burnt Forest, Eldoret.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Styling**: Tailwind CSS (monochromatic design)
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Fonts**: Cormorant Garamond (serif) + DM Sans (sans)

## Features

- **Monochromatic Design**: Pure white background with black/grey tones only
- **Mobile-First**: Responsive design optimized for mobile (375px base, 440px max desktop)
- **Rich Animations**: Framer Motion throughout - page transitions, overlays, card reveals
- **Offline Support**: Works without backend using static fallback data
- **Search**: Real-time search across all content with API + client-side fallback
- **Accessibility**: Respects `prefers-reduced-motion`, proper tap targets (44px min)

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start development servers (client + server)
npm run dev

# Build for production
npm run build
```

## Development

### Client (Port 3000)
```bash
cd client
npm run dev
```

### Server (Port 3001)
```bash
cd server  
npm run dev
```

## Project Structure

```
/client                 # React frontend
  /src
    /components        # React components
    /hooks            # Custom hooks (navigation, typewriter)
    /data             # Static fallback data
    /types            # TypeScript interfaces
    
/server                # Express backend
  /src
    /routes           # API routes (/api/content, /api/search)
    /data             # Seed data with Sister Anna Ali's story
```

## Key Components

- **HeroScreen**: Landing page with typewriter animation and portrait hero
- **ExplorerOverlay**: Bottom sheet with search and category navigation
- **CategoryGrid**: 3-column grid of content categories with Lucide icons
- **SubPage**: Reusable page template for content categories
- **ContentCard**: Animated cards with hover effects and content
- **MissionPage**: Special page for ongoing mission work
- **SearchResults**: Real-time search with API integration

## API Endpoints

- `GET /api/content` - All content data
- `GET /api/content/:pageId` - Content for specific page
- `GET /api/search?q=query` - Search across all content
- `GET /api/categories` - Category metadata

## Design System

- **Colors**: Monochromatic only (#FFFFFF, greys, blacks)
- **Typography**: Cormorant Garamond (headings/quotes) + DM Sans (body/UI)
- **Icons**: Lucide React throughout (no emoji)
- **Animation**: Framer Motion with reduced motion support
- **Layout**: Mobile-first, max-width 440px centered

## Content

The website contains the authentic story of Sister Anna Ali:

- **Her Life**: Born Hadija (1966), conversion (1983), religious life (1986-2012)
- **Visions**: Divine encounters with Jesus in Rome (1987-1988)
- **Stigmata**: Weekly tears of blood every Thursday for 25 years
- **Miracles**: Floating Host at funeral, healings at grave, peace in Burnt Forest
- **Her Book**: "On the Eucharist: A Divine Appeal" - divine messages about Eucharistic devotion
- **Mission**: Ongoing canonization process and works of mercy

## SEO & Meta

- Proper meta tags for Sister Anna Ali's biography
- robots.txt configured
- Cross icon favicon
- Semantic HTML structure

## License

This memorial website is created to honor Sister Anna Ali's legacy and promote devotion to her memory and teachings.