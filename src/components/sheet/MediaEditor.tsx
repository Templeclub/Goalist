'use client'

import { ImagePlus, Link2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useRef, useState } from 'react'
import { z } from 'zod'
import { LIMITS } from '@/config/app'
import { getBrowserClient } from '@/lib/supabase/browser'
import { uuidv7 } from '@/lib/uuid'
import { Button } from '../ui/Button'
import { inputClass } from '../ui/Field'

export type MediaItem = {
  id: string
  kind: 'image' | 'link'
  url: string | null
  title: string | null
  altText: string | null
  src: string | null
}

const Url = z.url({ protocol: /^https?$/ })

/** Re-encodes an image to WebP, at most 2000 px on its longest side (docs/plan.md §2.6). */
async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, LIMITS.imageMaxDimension / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('encode'))),
      'image/webp',
      0.85,
    ),
  )
}

async function postMedia(goalId: string, body: unknown) {
  const response = await fetch(`/api/goals/${goalId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(String(response.status))
  return (await response.json()) as { id: string }
}

/** Inspiration images (private storage, accounts only) and links. */
export function MediaEditor({
  goalId,
  initial,
  canUploadImages,
}: {
  goalId: string
  initial: MediaItem[]
  canUploadImages: boolean
}) {
  const t = useTranslations('flow.describe')
  const id = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  const addImage = async (file: File) => {
    setBusy(true)
    setMessage(t('uploading'))
    try {
      const supabase = getBrowserClient()
      const { data } = await supabase.auth.getClaims()
      const userId = data?.claims?.sub
      if (!userId) throw new Error('session')
      const blob = await toWebp(file)
      if (blob.size > LIMITS.imageMaxBytes) throw new Error('size')
      const path = `${userId}/${goalId}/${uuidv7()}.webp`
      const { error } = await supabase.storage
        .from('goal-media')
        .upload(path, blob, { contentType: 'image/webp' })
      if (error) throw error
      const created = await postMedia(goalId, { kind: 'image', storagePath: path, altText: null })
      setItems((list) => [
        ...list,
        {
          id: created.id,
          kind: 'image',
          url: null,
          title: null,
          altText: null,
          src: URL.createObjectURL(blob),
        },
      ])
      setMessage(null)
    } catch {
      setMessage(t('uploadFailed'))
    } finally {
      setBusy(false)
    }
  }

  const addLink = async () => {
    if (!Url.safeParse(url.trim()).success) return setMessage(t('linkInvalid'))
    setBusy(true)
    try {
      const created = await postMedia(goalId, {
        kind: 'link',
        url: url.trim(),
        title: title.trim() || null,
      })
      setItems((list) => [
        ...list,
        {
          id: created.id,
          kind: 'link',
          url: url.trim(),
          title: title.trim() || null,
          altText: null,
          src: null,
        },
      ])
      setUrl('')
      setTitle('')
      setLinkOpen(false)
      setMessage(null)
    } catch {
      setMessage(t('uploadFailed'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (item: MediaItem) => {
    setItems((list) => list.filter((m) => m.id !== item.id))
    const response = await fetch(`/api/goals/${goalId}/media/${item.id}`, {
      method: 'DELETE',
    }).catch(() => null)
    if (!response?.ok) setItems((list) => [...list, item])
  }

  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-3">
      <h2 id={`${id}-title`} className="font-bold">
        {t('media')}
      </h2>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2.5">
          {items.map((item) => (
            <li key={item.id} className="relative">
              {item.kind === 'image' ? (
                item.src && (
                  // eslint-disable-next-line @next/next/no-img-element -- signed, private, already resized
                  <img
                    src={item.src}
                    alt={item.altText ?? t('imageLabel')}
                    className="h-26 w-38 rounded-[10px] object-cover"
                  />
                )
              ) : (
                <a
                  href={item.url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex h-26 w-38 flex-col justify-end gap-1 rounded-[10px] border border-line bg-card p-3 text-sm"
                >
                  <Link2 aria-hidden="true" className="size-4 text-ink-3" />
                  <span className="line-clamp-2 font-semibold break-all">
                    {item.title ?? item.url?.replace(/^https?:\/\//, '')}
                  </span>
                </a>
              )}
              <button
                type="button"
                onClick={() => void remove(item)}
                aria-label={t('remove', {
                  name: item.title ?? item.altText ?? item.url ?? t('imageLabel'),
                })}
                className="absolute -top-2 -right-2 grid size-8 cursor-pointer place-items-center rounded-full border border-line-strong bg-card text-ink-2 shadow-card"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2.5">
        {canUploadImages ? (
          <>
            <input
              ref={fileRef}
              id={`${id}-file`}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void addImage(file)
                e.target.value = ''
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus aria-hidden="true" className="size-4" />
              {t('addImage')}
            </Button>
          </>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          disabled={busy}
          aria-expanded={linkOpen}
          onClick={() => setLinkOpen(!linkOpen)}
        >
          <Link2 aria-hidden="true" className="size-4" />
          {t('addLink')}
        </Button>
      </div>
      {!canUploadImages && <p className="text-sm text-ink-3">{t('imagesNeedAccount')}</p>}
      {linkOpen && (
        <div className="grid gap-2 rounded-md bg-paper-2 p-3">
          <label htmlFor={`${id}-url`} className="text-sm font-bold">
            {t('linkUrl')}
          </label>
          <input
            id={`${id}-url`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            inputMode="url"
            placeholder="https://"
            className={inputClass}
          />
          <label htmlFor={`${id}-link-title`} className="text-sm font-bold">
            {t('linkTitle')}
          </label>
          <input
            id={`${id}-link-title`}
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
          <Button
            size="sm"
            className="justify-self-start"
            disabled={busy}
            onClick={() => void addLink()}
          >
            {t('addLink')}
          </Button>
        </div>
      )}
      {message && (
        <p role="status" className="text-[0.9375rem] text-ink-2">
          {message}
        </p>
      )}
    </section>
  )
}
