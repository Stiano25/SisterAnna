import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, Plus, Save, Upload, Trash2 } from 'lucide-react'
import type { Category, ContentBlock } from '../types'

type AdminTopic = {
  id: string
  categoryId: string
  eyebrow: string
  title: string
  tag: string
  sortOrder: number
  summaryText: string
  updatedAt: string
}

type AdminImage = {
  id: string
  alt: string
  mimeType: string
  filename: string
  sortOrder: number
  createdAt: string
}

type AdminGalleryImage = {
  id: string
  alt: string
  filename: string
  sortOrder: number
  createdAt: string
}

type AdminStep = 'category' | 'topics' | 'gallery'

interface AdminPageProps {
  onBack: () => void
}

const FieldHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-memorial-muted leading-relaxed mt-1">{children}</p>
)

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authToken, setAuthToken] = useState<string | null>(null)

  const [adminStep, setAdminStep] = useState<AdminStep>('category')

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')

  const [categoryDraft, setCategoryDraft] = useState<Partial<Category>>({})
  const [newCategory, setNewCategory] = useState({
    id: '',
    label: '',
    sublabel: '',
    iconName: 'Eye'
  })

  const [topicDraft, setTopicDraft] = useState<{ eyebrow: string; title: string; tag: string; blocks: ContentBlock[] }>(
    { eyebrow: '', title: '', tag: '', blocks: [] }
  )
  const [images, setImages] = useState<AdminImage[]>([])
  const [galleryImages, setGalleryImages] = useState<AdminGalleryImage[]>([])

  const [selectedImageId, setSelectedImageId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authHeader = useMemo(() => {
    if (!authToken) return null
    return { Authorization: `Bearer ${authToken}` }
  }, [authToken])

  const apiFetch = async (path: string, init?: RequestInit) => {
    if (!authHeader) throw new Error('Not authenticated')
    const res = await fetch(`/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
        ...authHeader
      }
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.error || `Request failed: ${res.status}`)
    }
    return res
  }

  const fetchCategories = async () => {
    const res = await apiFetch('/admin/categories', { method: 'GET' })
    const data = (await res.json()) as Category[]
    setCategories(data)
    if (!selectedCategoryId && data[0]) setSelectedCategoryId(data[0].id)
  }

  const fetchTopics = async (categoryId: string, options?: { skipTopicSelection?: boolean }) => {
    const res = await apiFetch(`/admin/categories/${categoryId}/topics`, { method: 'GET' })
    const data = (await res.json()) as AdminTopic[]
    setTopics(data)
    if (options?.skipTopicSelection) {
      setSelectedTopicId('')
      return
    }
    setSelectedTopicId((prev) => {
      if (prev && data.some((t) => t.id === prev)) return prev
      return data[0]?.id ?? ''
    })
  }

  const fetchTopic = async (topicId: string) => {
    const res = await apiFetch(`/admin/topics/${topicId}`, { method: 'GET' })
    const data = (await res.json()) as { topic: AdminTopic | null; blocks: ContentBlock[]; images: AdminImage[] }
    if (!data.topic) return
    setSelectedTopicId(topicId)
    setImages(data.images)
    setSelectedImageId(data.images[0]?.id || '')
    setTopicDraft({
      eyebrow: data.topic.eyebrow,
      title: data.topic.title,
      tag: data.topic.tag,
      blocks: data.blocks || []
    })

    const cat = categories.find((c) => c.id === data.topic?.categoryId)
    setCategoryDraft(cat ?? {})
  }

  useEffect(() => {
    if (!authToken) return
    void (async () => {
      setError(null)
      try {
        setLoading(true)
        await fetchCategories()
        await fetchGalleryImages()
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken])

  useEffect(() => {
    const cat = categories.find((c) => c.id === selectedCategoryId)
    if (cat) setCategoryDraft({ ...cat })
  }, [selectedCategoryId, categories])

  useEffect(() => {
    if (!authToken) return
    if (!selectedCategoryId) return
    if (adminStep === 'gallery') return
    void (async () => {
      setError(null)
      setLoading(true)
      try {
        await fetchTopics(selectedCategoryId, { skipTopicSelection: adminStep === 'category' })
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, adminStep])

  useEffect(() => {
    if (!authToken) return
    if (!selectedTopicId) return
    if (adminStep !== 'topics') return
    void (async () => {
      setError(null)
      setLoading(true)
      try {
        await fetchTopic(selectedTopicId)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopicId, adminStep])

  const handleLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Login failed')
      }
      const data = (await res.json()) as { token: string }
      setAuthToken(data.token)
    } finally {
      setLoading(false)
    }
  }

  const saveCategory = async () => {
    if (!selectedCategoryId) return
    if (!categoryDraft.label || !categoryDraft.sublabel || !categoryDraft.iconName) return
    setError(null)
    setLoading(true)
    try {
      await apiFetch(`/admin/categories/${selectedCategoryId}`, {
        method: 'PUT',
        body: JSON.stringify({
          label: categoryDraft.label,
          sublabel: categoryDraft.sublabel,
          iconName: categoryDraft.iconName
        })
      })
      await fetchCategories()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async () => {
    const id = newCategory.id.trim().toLowerCase()
    if (!id || !newCategory.label.trim() || !newCategory.sublabel.trim() || !newCategory.iconName.trim()) {
      setError('Fill in section id, title, subtitle, and icon.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          id,
          label: newCategory.label.trim(),
          sublabel: newCategory.sublabel.trim(),
          iconName: newCategory.iconName.trim()
        })
      })
      setNewCategory({ id: '', label: '', sublabel: '', iconName: 'Eye' })
      await fetchCategories()
      setSelectedCategoryId(id)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const continueToTopics = () => {
    if (!selectedCategoryId) return
    setAdminStep('topics')
    setSelectedTopicId((prev) => {
      if (prev && topics.some((t) => t.id === prev)) return prev
      return topics[0]?.id ?? ''
    })
  }

  const backToCategoryStep = () => {
    setAdminStep('category')
    setSelectedTopicId('')
  }

  const createTopic = async () => {
    if (!selectedCategoryId) return
    setError(null)
    setLoading(true)
    try {
      const res = await apiFetch(`/admin/categories/${selectedCategoryId}/topics`, {
        method: 'POST',
        body: JSON.stringify({ title: 'New Topic', eyebrow: '', tag: '' })
      })
      const data = (await res.json()) as { id: string }
      setSelectedTopicId(data.id)
      await fetchTopics(selectedCategoryId)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const saveTopic = async () => {
    if (!selectedTopicId) return
    setError(null)
    setLoading(true)
    try {
      await apiFetch(`/admin/topics/${selectedTopicId}`, {
        method: 'PUT',
        body: JSON.stringify({
          eyebrow: topicDraft.eyebrow,
          title: topicDraft.title,
          tag: topicDraft.tag,
          blocks: topicDraft.blocks
        })
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const deleteTopic = async () => {
    if (!selectedTopicId) return
    setError(null)
    setLoading(true)
    try {
      await apiFetch(`/admin/topics/${selectedTopicId}`, { method: 'DELETE' })
      setSelectedTopicId('')
      await fetchTopics(selectedCategoryId)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!selectedTopicId) return

    setError(null)
    setLoading(true)
    try {
      const form = new FormData()
      Array.from(files).forEach((f) => form.append('images', f))

      const res = await fetch(`/api/admin/topics/${selectedTopicId}/images`, {
        method: 'POST',
        headers: authHeader || undefined,
        body: form
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Upload failed: ${res.status}`)
      }
      await fetchTopic(selectedTopicId)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const fetchGalleryImages = async () => {
    if (!authHeader) return
    setError(null)
    try {
      const res = await apiFetch('/admin/gallery/images', { method: 'GET' })
      const data = (await res.json()) as AdminGalleryImage[]
      setGalleryImages(data)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const uploadGalleryImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setLoading(true)
    try {
      const form = new FormData()
      Array.from(files).forEach((f) => form.append('images', f))

      const res = await fetch('/api/admin/gallery/images', {
        method: 'POST',
        headers: authHeader || undefined,
        body: form
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Upload failed: ${res.status}`)
      }
      await fetchGalleryImages()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const moveBlock = (index: number, dir: -1 | 1) => {
    setTopicDraft((prev) => {
      const next = [...prev.blocks]
      const to = index + dir
      if (to < 0 || to >= next.length) return prev
      ;[next[index], next[to]] = [next[to], next[index]]
      return { ...prev, blocks: next }
    })
  }

  const removeBlock = (index: number) => {
    setTopicDraft((prev) => {
      const next = [...prev.blocks]
      next.splice(index, 1)
      return { ...prev, blocks: next }
    })
  }

  const canContinueToTopics = Boolean(selectedCategoryId)

  return (
    <div className="min-h-screen bg-memorial spiritual-page">
      <div className="sticky top-0 z-30 spiritual-header border-b border-memorial-line">
        <div className="flex items-center justify-between p-4 sm:p-8">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onBack}
              className="p-3 rounded-full border border-memorial-line hover:bg-memorial-card/80 spiritual-depth transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center text-memorial-accent"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <h1 className="font-sans text-xl sm:text-2xl italic text-memorial-ink font-bold">Admin</h1>
          </div>
        </div>
      </div>

      {!authToken ? (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-memorial-line bg-memorial-card p-6 shadow-sm">
            <div className="mb-4">
              <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em] mb-2">
                Login
              </div>
              <p className="text-memorial-muted text-sm leading-relaxed">
                Enter admin email and password.
              </p>
            </div>
            <label className="block text-sm font-bold text-memorial-muted mb-2">Admin email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-memorial-accent mb-3"
            />
            <label className="block text-sm font-bold text-memorial-muted mb-2">Admin password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-memorial-accent"
            />
            {error ? <div className="text-sm text-red-600 mt-3">{error}</div> : null}
            <div className="mt-5 flex gap-3">
              <motion.button
                type="button"
                onClick={handleLogin}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-memorial-ink text-memorial-card font-bold shadow-lg hover:opacity-95 transition-opacity"
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <LockIcon />
                Login
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-8">
          <div className="max-w-6xl mx-auto mb-4">
            <div className="rounded-2xl border border-memorial-line bg-memorial-card/70 p-4 sm:p-5">
              <h2 className="font-sans text-lg sm:text-xl text-memorial-ink font-bold">Content Management</h2>
              <p className="text-sm text-memorial-muted mt-1">
                Manage sections, stories, and gallery images from one place.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6 max-w-6xl mx-auto">
            <button
              type="button"
              onClick={() => {
                setAdminStep('category')
                setSelectedTopicId('')
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                adminStep === 'category'
                  ? 'bg-memorial-accent text-memorial-card border-memorial-accent'
                  : 'bg-memorial-card text-memorial-muted border-memorial-line hover:border-memorial-accent/50'
              }`}
            >
              1. Section (navigation)
            </button>
            <span className="self-center text-memorial-muted text-sm" aria-hidden>
              →
            </span>
            <button
              type="button"
              onClick={() => {
                if (!canContinueToTopics) return
                setAdminStep('topics')
                setSelectedTopicId((prev) => {
                  if (prev && topics.some((t) => t.id === prev)) return prev
                  return topics[0]?.id ?? ''
                })
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                adminStep === 'topics'
                  ? 'bg-memorial-accent text-memorial-card border-memorial-accent'
                  : 'bg-memorial-card text-memorial-muted border-memorial-line hover:border-memorial-accent/50'
              }`}
              disabled={!canContinueToTopics}
            >
              2. Stories (topics)
            </button>
            <span className="self-center text-memorial-muted text-sm" aria-hidden>
              →
            </span>
            <button
              type="button"
              onClick={() => setAdminStep('gallery')}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                adminStep === 'gallery'
                  ? 'bg-memorial-accent text-memorial-card border-memorial-accent'
                  : 'bg-memorial-card text-memorial-muted border-memorial-line hover:border-memorial-accent/50'
              }`}
            >
              3. Gallery
            </button>
          </div>

          {adminStep === 'category' ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="rounded-2xl border border-memorial-line bg-memorial-card p-5 shadow-sm">
                <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em] mb-2">
                  Choose or edit a section
                </div>
                <p className="text-sm text-memorial-muted leading-relaxed mb-4">
                  Sections appear in the app navigation. Set the title, subtitle, and icon before editing individual
                  stories.
                </p>
                <label className="block text-sm font-bold text-memorial-muted mb-2">Section</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                  disabled={loading}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div className="mt-6 space-y-4 border-t border-memorial-line pt-5">
                  <label className="block text-sm font-bold text-memorial-ink">Section title</label>
                  <FieldHint>Shown as the main name of this group in the app (home and menus).</FieldHint>
                  <input
                    value={categoryDraft.label ?? ''}
                    onChange={(e) => setCategoryDraft((p) => ({ ...p, label: e.target.value }))}
                    className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                  />
                  <label className="block text-sm font-bold text-memorial-ink mt-2">Section subtitle</label>
                  <FieldHint>Short line under the title (theme or description).</FieldHint>
                  <input
                    value={categoryDraft.sublabel ?? ''}
                    onChange={(e) => setCategoryDraft((p) => ({ ...p, sublabel: e.target.value }))}
                    className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                  />
                  <label className="block text-sm font-bold text-memorial-ink mt-2">Icon (Lucide name)</label>
                  <FieldHint>
                    Must match a Lucide icon used by the app, e.g. Eye, Cross, BookOpen, Compass, Sparkles, Droplets.
                  </FieldHint>
                  <input
                    value={categoryDraft.iconName ?? ''}
                    onChange={(e) => setCategoryDraft((p) => ({ ...p, iconName: e.target.value }))}
                    className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void saveCategory()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-memorial-ink text-memorial-card font-bold shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50 mt-2"
                    disabled={loading}
                  >
                    <Save className="w-5 h-5" strokeWidth={1.5} />
                    Save section
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-memorial-line bg-memorial-card p-5 shadow-sm">
                <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em] mb-2">
                  Add a new section
                </div>
                <p className="text-sm text-memorial-muted leading-relaxed mb-4">
                  The section id is used in URLs and data: lowercase letters, numbers, and hyphens only (e.g.{' '}
                  <span className="font-mono text-memorial-ink">about-sister-anna</span>).
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-memorial-muted mb-1">Section id (URL slug)</label>
                    <input
                      value={newCategory.id}
                      onChange={(e) => setNewCategory((p) => ({ ...p, id: e.target.value }))}
                      className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none font-mono text-sm"
                      placeholder="e.g. memorial-notes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-memorial-muted mb-1">Section title</label>
                    <input
                      value={newCategory.label}
                      onChange={(e) => setNewCategory((p) => ({ ...p, label: e.target.value }))}
                      className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                      placeholder="Title shown in the app"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-memorial-muted mb-1">Section subtitle</label>
                    <input
                      value={newCategory.sublabel}
                      onChange={(e) => setNewCategory((p) => ({ ...p, sublabel: e.target.value }))}
                      className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-memorial-muted mb-1">Icon (Lucide name)</label>
                    <input
                      value={newCategory.iconName}
                      onChange={(e) => setNewCategory((p) => ({ ...p, iconName: e.target.value }))}
                      className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void createCategory()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border-2 border-memorial-accent text-memorial-accent font-bold hover:bg-memorial-accent/10 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    <Plus className="w-5 h-5" strokeWidth={1.5} />
                    Create section
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={continueToTopics}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-memorial-ink text-memorial-card font-bold shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50"
                  disabled={loading || !canContinueToTopics}
                >
                  Continue to stories
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {error ? <div className="text-sm text-red-600">{error}</div> : null}
            </div>
          ) : adminStep === 'topics' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="lg:col-span-1 space-y-4">
                <button
                  type="button"
                  onClick={backToCategoryStep}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-memorial-line text-memorial-muted font-bold hover:border-memorial-accent/60 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  Back to section settings
                </button>

                <div className="rounded-2xl border border-memorial-line bg-memorial-card p-5 shadow-sm">
                  <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em] mb-1">
                    Current section
                  </div>
                  <div className="font-bold text-memorial-ink">{categories.find((c) => c.id === selectedCategoryId)?.label ?? '—'}</div>
                  <p className="text-xs text-memorial-muted mt-2">
                    Editing topics under this section. To change the section title or add sections, go back to step 1.
                  </p>
                </div>

                <div className="rounded-2xl border border-memorial-line bg-memorial-card p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em]">
                      Stories (topics)
                    </div>
                    <button
                      type="button"
                      onClick={() => void createTopic()}
                      className="p-2 rounded-full hover:bg-memorial-card/70 transition-colors"
                      disabled={loading || !selectedCategoryId}
                      aria-label="Create topic"
                    >
                      <Plus className="w-5 h-5 text-memorial-accent" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                    {topics.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTopicId(t.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          t.id === selectedTopicId
                            ? 'bg-memorial-accent text-memorial-card border-memorial-accent'
                            : 'bg-memorial-card text-memorial-ink border-memorial-line hover:border-memorial-accent/60'
                        }`}
                        disabled={loading}
                      >
                        <div
                          className={`text-xs uppercase tracking-[0.1em] mb-2 font-bold ${
                            t.id === selectedTopicId ? 'text-memorial-card/90' : 'text-memorial-muted'
                          }`}
                        >
                          {t.eyebrow || 'No context line yet'}
                        </div>
                        <div className="font-sans font-bold leading-snug">{t.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-memorial-line bg-memorial-card p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <div>
                      <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em] mb-2">
                        Story editor
                      </div>
                      <div className="text-xs text-memorial-muted">
                        {selectedTopicId ? `Topic id: ${selectedTopicId}` : 'Select a story from the list'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void saveTopic()}
                        className="px-4 py-2 rounded-full bg-memorial-ink text-memorial-card font-bold shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        disabled={loading || !selectedTopicId}
                      >
                        <Save className="w-5 h-5" strokeWidth={1.5} />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteTopic()}
                        className="px-4 py-2 rounded-full bg-memorial-card text-memorial-ink font-bold border border-memorial-line hover:border-memorial-accent/60 transition-colors disabled:opacity-50 flex items-center gap-2"
                        disabled={loading || !selectedTopicId}
                      >
                        <Trash2 className="w-5 h-5 text-memorial-accent" strokeWidth={1.5} />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-memorial-ink">Context line (small text above title)</label>
                      <FieldHint>Shown in small caps above the headline on the public story page (date, place, or theme).</FieldHint>
                      <input
                        value={topicDraft.eyebrow}
                        onChange={(e) => setTopicDraft((p) => ({ ...p, eyebrow: e.target.value }))}
                        className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                        disabled={loading || !selectedTopicId}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-memorial-ink">Badge (tag under title)</label>
                      <FieldHint>Shown as the rounded label under the story title for visitors.</FieldHint>
                      <input
                        value={topicDraft.tag}
                        onChange={(e) => setTopicDraft((p) => ({ ...p, tag: e.target.value }))}
                        className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                        disabled={loading || !selectedTopicId}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-bold text-memorial-ink">Story title</label>
                    <FieldHint>Main headline on the story page.</FieldHint>
                    <input
                      value={topicDraft.title}
                      onChange={(e) => setTopicDraft((p) => ({ ...p, title: e.target.value }))}
                      className="w-full bg-transparent border border-memorial-line rounded-xl px-4 py-3 text-base text-memorial-ink outline-none"
                      disabled={loading || !selectedTopicId}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-memorial-line bg-memorial-card/60 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em]">
                          Images
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-full border border-memorial-line hover:border-memorial-accent/60 transition-colors text-sm font-bold text-memorial-muted">
                          <Upload className="w-4 h-4 text-memorial-accent" strokeWidth={1.5} />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => void uploadImages(e.target.files)}
                            disabled={loading || !selectedTopicId}
                          />
                        </label>
                        {images.length > 0 ? (
                          <select
                            value={selectedImageId}
                            onChange={(e) => setSelectedImageId(e.target.value)}
                            className="flex-1 bg-transparent border border-memorial-line rounded-xl px-3 py-2 text-sm outline-none"
                            disabled={loading || images.length === 0}
                          >
                            {images.map((img) => (
                              <option key={img.id} value={img.id}>
                                {img.alt || img.filename}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto pr-1">
                        {images.map((img) => (
                          <div
                            key={img.id}
                            className={`rounded-xl border overflow-hidden ${img.id === selectedImageId ? 'border-memorial-accent' : 'border-memorial-line'}`}
                          >
                            <img
                              src={`/api/images/${img.id}`}
                              alt={img.alt || 'Story image'}
                              className="w-full h-20 object-cover bg-memorial-card"
                            />
                          </div>
                        ))}
                        {images.length === 0 ? (
                          <div className="col-span-3 text-sm text-memorial-muted">Upload images to insert them inline.</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-memorial-line bg-memorial-card/60 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em]">
                          Story blocks
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setTopicDraft((p) => ({
                                ...p,
                                blocks: [...p.blocks, { type: 'text', value: '' }]
                              }))
                            }
                            className="p-2 rounded-full hover:bg-memorial-card/70 transition-colors"
                            disabled={loading || !selectedTopicId}
                            aria-label="Add text block"
                          >
                            <Plus className="w-5 h-5 text-memorial-accent" strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedImageId) return
                              setTopicDraft((p) => ({
                                ...p,
                                blocks: [...p.blocks, { type: 'image', imageId: selectedImageId }]
                              }))
                            }}
                            className="p-2 rounded-full hover:bg-memorial-card/70 transition-colors disabled:opacity-50"
                            disabled={loading || !selectedTopicId || !selectedImageId}
                            aria-label="Add image block"
                          >
                            <Upload className="w-5 h-5 text-memorial-accent" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                        {topicDraft.blocks.map((block, idx) => (
                          <div key={`${idx}_${block.type}`} className="border border-memorial-line rounded-2xl bg-memorial-card p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="text-xs uppercase tracking-[0.1em] text-memorial-muted font-bold">
                                {block.type === 'text' ? 'Text' : 'Image'}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveBlock(idx, -1)}
                                  className="p-1.5 rounded-lg border border-memorial-line hover:border-memorial-accent/60 transition-colors disabled:opacity-50"
                                  disabled={loading || idx === 0}
                                  aria-label="Move up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveBlock(idx, 1)}
                                  className="p-1.5 rounded-lg border border-memorial-line hover:border-memorial-accent/60 transition-colors disabled:opacity-50"
                                  disabled={loading || idx === topicDraft.blocks.length - 1}
                                  aria-label="Move down"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeBlock(idx)}
                                  className="p-1.5 rounded-lg border border-memorial-line hover:border-red-400 transition-colors disabled:opacity-50"
                                  disabled={loading}
                                  aria-label="Remove block"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>

                            {block.type === 'text' ? (
                              <textarea
                                value={block.value}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setTopicDraft((p) => {
                                    const next = [...p.blocks]
                                    const cur = next[idx] as { type: 'text'; value: string }
                                    next[idx] = { ...cur, value }
                                    return { ...p, blocks: next }
                                  })
                                }}
                                className="w-full min-h-[120px] bg-transparent border border-memorial-line rounded-xl px-3 py-2 text-sm text-memorial-ink outline-none"
                                disabled={loading || !selectedTopicId}
                              />
                            ) : (
                              <div className="space-y-2">
                                <select
                                  value={block.imageId}
                                  onChange={(e) => {
                                    const imageId = e.target.value
                                    setTopicDraft((p) => {
                                      const next = [...p.blocks]
                                      const cur = next[idx] as { type: 'image'; imageId: string }
                                      next[idx] = { ...cur, imageId }
                                      return { ...p, blocks: next }
                                    })
                                  }}
                                  className="w-full bg-transparent border border-memorial-line rounded-xl px-3 py-2 text-sm outline-none"
                                  disabled={loading || images.length === 0}
                                >
                                  {images.map((img) => (
                                    <option key={img.id} value={img.id}>
                                      {img.alt || img.filename}
                                    </option>
                                  ))}
                                </select>
                                <img
                                  src={`/api/images/${block.imageId}`}
                                  alt="Selected story image"
                                  className="w-full h-56 object-cover rounded-xl border border-memorial-line bg-memorial-card"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        {topicDraft.blocks.length === 0 ? (
                          <div className="text-sm text-memorial-muted">Add text or image blocks to build the story visitors will read.</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {error ? <div className="text-sm text-red-600">{error}</div> : null}
              </div>

            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="rounded-2xl border border-memorial-line bg-memorial-card p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <div className="text-sm text-memorial-muted font-bold uppercase tracking-[0.1em]">
                      Gallery images
                    </div>
                    <p className="text-sm text-memorial-muted mt-1">
                      Upload images here to display them on the public Gallery page.
                    </p>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full border border-memorial-line hover:border-memorial-accent/60 transition-colors text-sm font-bold text-memorial-muted">
                    <Upload className="w-4 h-4 text-memorial-accent" strokeWidth={1.5} />
                    Upload to gallery
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => void uploadGalleryImages(e.target.files)}
                      disabled={loading}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[65vh] overflow-y-auto pr-1">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="rounded-xl overflow-hidden border border-memorial-line bg-memorial-card/80">
                      <img
                        src={`/api/images/gallery/${img.id}`}
                        alt={img.alt || img.filename}
                        className="w-full h-28 object-cover"
                      />
                    </div>
                  ))}
                  {galleryImages.length === 0 ? (
                    <div className="col-span-2 text-sm text-memorial-muted">No gallery images uploaded yet.</div>
                  ) : null}
                </div>
              </div>
              {error ? <div className="text-sm text-red-600 mt-3">{error}</div> : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const LockIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 11V7C17 4.79086 15.2091 3 13 3H11C8.79086 3 7 4.79086 7 7V11"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M7 11H17C18.1046 11 19 11.8954 19 13V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V13C5 11.8954 5.89543 11 7 11Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default AdminPage
