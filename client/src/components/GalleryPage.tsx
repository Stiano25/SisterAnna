import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

interface GalleryPageProps {
  onBack: () => void
}

type GalleryImage = {
  id: string
  alt: string
  filename: string
}

const GalleryPage: React.FC<GalleryPageProps> = ({ onBack }) => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    const load = async () => {
      setError(null)
      setLoading(true)
      try {
        const res = await fetch('/api/gallery/images')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || `Failed to load gallery: ${res.status}`)
        }
        const data = (await res.json()) as GalleryImage[]
        setImages(data)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <motion.div
      className="min-h-screen spiritual-page bg-memorial"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <div className="sticky top-0 z-10 spiritual-header border-b border-memorial-line">
        <div className="flex items-center justify-between p-4 sm:p-8">
          <div className="flex items-center gap-5">
            <motion.button
              onClick={onBack}
              className="p-3 rounded-full border border-memorial-line hover:bg-memorial-card/80 spiritual-depth transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center text-memorial-accent"
              whileTap={{ scale: 0.95 }}
              whileHover={{ x: -2 }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </motion.button>
            <h1 className="font-sans text-xl sm:text-2xl italic text-memorial-ink font-bold">
              Gallery
            </h1>
          </div>
          <ImageIcon className="w-10 h-10 text-memorial-accent" strokeWidth={0.8} />
        </div>
      </div>

      <div className="p-4 sm:p-8 spiritual-inset">
        {loading ? (
          <div className="rounded-2xl border border-memorial-line bg-memorial-card spiritual-card-depth p-8 sm:p-12 text-center">
            <p className="text-memorial-muted text-lg leading-relaxed max-w-sm mx-auto">Loading gallery…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-memorial-line bg-memorial-card spiritual-card-depth p-8 sm:p-12 text-center">
            <p className="text-red-600 text-sm leading-relaxed max-w-sm mx-auto">{error}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-memorial-line bg-memorial-card spiritual-card-depth p-8 sm:p-12 text-center">
            <ImageIcon className="w-14 h-14 text-memorial-accent/50 mx-auto mb-6" strokeWidth={0.9} />
            <p className="text-memorial-muted text-lg leading-relaxed max-w-sm mx-auto">
              No gallery images have been uploaded yet.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-memorial-line bg-memorial-card spiritual-card-depth p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className="rounded-xl overflow-hidden border border-memorial-line bg-memorial-card/80"
                >
                  <img
                    src={`/api/images/gallery/${img.id}`}
                    alt={img.alt || img.filename}
                    className="w-full h-32 sm:h-40 object-cover hover:scale-[1.02] transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {activeImage ? (
        <div
          className="fixed inset-0 z-40 bg-black/80 p-4 sm:p-8 flex items-center justify-center"
          onClick={() => setActiveImage(null)}
        >
          <img
            src={`/api/images/gallery/${activeImage.id}`}
            alt={activeImage.alt || activeImage.filename}
            className="max-w-full max-h-[90vh] object-contain rounded-xl border border-white/20"
          />
        </div>
      ) : null}
    </motion.div>
  )
}

export default GalleryPage
