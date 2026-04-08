import React from 'react'
import { Cross } from 'lucide-react'

interface PageLoaderProps {
  label?: string
}

const PageLoader: React.FC<PageLoaderProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="min-h-screen spiritual-page flex items-center justify-center">
      <div className="flex flex-col items-center gap-2.5 text-memorial-muted">
        <div className="spiritual-loader">
          <Cross className="w-7 h-7 text-memorial-accent" strokeWidth={1.4} />
        </div>
        <p className="text-xs font-semibold tracking-[0.08em] uppercase">{label}</p>
      </div>
    </div>
  )
}

export default PageLoader
