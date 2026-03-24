import { rmSync } from 'fs'
import { join } from 'path'

try {
  // Clear Vite cache
  rmSync(join(process.cwd(), 'node_modules/.vite'), { recursive: true, force: true })
  console.log('✅ Vite cache cleared')
  
  // Clear dist folder
  rmSync(join(process.cwd(), 'dist'), { recursive: true, force: true })
  console.log('✅ Dist folder cleared')
  
} catch (error) {
  console.log('Cache folders already clean or not found')
}

console.log('🚀 Ready to restart dev server')