'use client'

import { Lock, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { callApi } from '@/features/friends/client-api'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { uuidv7 } from '@/lib/uuid'

type Visibility = 'private' | 'circle'

type ShareToggleProps = {
  goalId: string
  version: number
  visibility: Visibility
  api?: typeof callApi
}

/** « Qui peut voir cette carte ? »: me only (default) or my friends (D-064). */
export function ShareToggle({ goalId, version, visibility, api = callApi }: ShareToggleProps) {
  const t = useTranslations('friends')
  const id = useId()
  const router = useRouter()
  const [value, setValue] = useState<Visibility>(visibility)
  const [localVersion, setLocalVersion] = useState(version)
  const [failed, setFailed] = useState(false)

  const choose = async (next: Visibility) => {
    if (next === value) return
    const previous = value
    setValue(next)
    const res = await api<{ version?: number }>(`/api/goals/${goalId}`, 'PATCH', {
      patch: { visibility: next },
      baseVersion: Math.max(version, localVersion),
      clientMutationId: uuidv7(),
    })
    setFailed(!res)
    if (!res) return setValue(previous)
    if (res.version) setLocalVersion(res.version)
    router.refresh()
  }

  const options: { value: Visibility; label: string; Icon: typeof Lock }[] = [
    { value: 'private', label: t('share.private'), Icon: Lock },
    { value: 'circle', label: t('share.friends'), Icon: Users },
  ]

  return (
    <fieldset className="grid gap-2" aria-describedby={`${id}-hint`}>
      <legend className="mb-1 font-extrabold">{t('share.legend')}</legend>
      <div role="radiogroup" className="grid grid-cols-2 gap-2">
        {options.map(({ value: v, label, Icon }) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => void choose(v)}
            className={cn(
              'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border-2 font-extrabold',
              value === v
                ? 'border-outline bg-accent text-ink-on-accent shadow-card'
                : 'border-line-strong bg-card text-ink hover:bg-paper-2',
            )}
          >
            <Icon aria-hidden="true" className="size-4 stroke-[2.5]" />
            {label}
          </button>
        ))}
      </div>
      <p id={`${id}-hint`} className="text-sm text-ink-2">
        {t('share.hint')}
      </p>
      {failed && (
        <p role="status" className="text-sm font-bold text-ink-2">
          {t('failed')}
        </p>
      )}
    </fieldset>
  )
}
