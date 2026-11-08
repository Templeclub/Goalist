'use client'

import { EditorContent, useEditor, useEditorState, type JSONContent } from '@tiptap/react'
import { Bold, Heading3, Italic, Link2, List, ListOrdered } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'
import type { RichDoc } from '@/features/goals/rich-text'
import { cn } from '@/lib/cn'
import { Button } from '../ui/Button'
import { editorExtensions } from './editor-extensions'
import { Chip } from '../ui/Chip'
import { inputClass } from '../ui/Field'

type RichTextEditorProps = {
  id: string
  labelledBy: string
  value: RichDoc | null
  onChange: (doc: RichDoc | null) => void
  placeholder: string
  /** Guiding questions inserted as paragraph headings (no AI: written by hand). */
  prompts?: string[]
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'grid size-10 cursor-pointer place-items-center rounded-sm text-ink-2 hover:bg-card hover:text-ink [&>svg]:size-5 [&>svg]:stroke-[1.75]',
        active && 'bg-card text-accent-strong shadow-card',
      )}
    >
      {children}
    </button>
  )
}

/** Light rich text (Tiptap, restricted schema — D-008). Undo/redo: Ctrl/Cmd+Z. */
export function RichTextEditor({
  id,
  labelledBy,
  value,
  onChange,
  placeholder,
  prompts = [],
}: RichTextEditorProps) {
  const t = useTranslations('flow.describe')
  const [linkOpen, setLinkOpen] = useState(false)
  const [href, setHref] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: editorExtensions(placeholder),
    content: (value as JSONContent | null) ?? '',
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelledBy,
        class: 'prose-elan min-h-36 px-4 py-3.5 text-md leading-relaxed outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? null : (editor.getJSON() as RichDoc))
    },
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            heading: e.isActive('heading', { level: 3 }),
            link: e.isActive('link'),
          }
        : null,
  })

  const insertPrompt = (prompt: string) => {
    editor
      ?.chain()
      .focus('end')
      .insertContent([
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: prompt }] },
        { type: 'paragraph' },
      ])
      .run()
  }

  const applyLink = () => {
    const url = href.trim()
    if (!editor) return
    if (!url) editor.chain().focus().unsetLink().run()
    else if (/^(https?:\/\/|mailto:)/i.test(url))
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setLinkOpen(false)
    setHref('')
  }

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-md border border-line-strong bg-card focus-within:border-accent focus-within:outline-2 focus-within:outline-accent">
        <div
          role="toolbar"
          aria-label={t('toolbar')}
          className="flex flex-wrap gap-0.5 border-b border-line bg-paper-2 px-1.5 py-1"
        >
          <ToolButton
            label={t('bold')}
            active={state?.bold}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold />
          </ToolButton>
          <ToolButton
            label={t('italic')}
            active={state?.italic}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic />
          </ToolButton>
          <ToolButton
            label={t('bulletList')}
            active={state?.bullet}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List />
          </ToolButton>
          <ToolButton
            label={t('orderedList')}
            active={state?.ordered}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered />
          </ToolButton>
          <ToolButton
            label={t('heading')}
            active={state?.heading}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 />
          </ToolButton>
          <ToolButton
            label={t('link')}
            active={state?.link || linkOpen}
            onClick={() => {
              setHref((editor?.getAttributes('link').href as string | undefined) ?? '')
              setLinkOpen(!linkOpen)
            }}
          >
            <Link2 />
          </ToolButton>
        </div>
        {linkOpen && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
            <label htmlFor={`${id}-href`} className="sr-only">
              {t('linkPrompt')}
            </label>
            <input
              id={`${id}-href`}
              value={href}
              onChange={(e) => setHref(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyLink()
                }
              }}
              placeholder="https://"
              inputMode="url"
              className={cn(inputClass, 'min-w-0 flex-1 py-2 text-base')}
            />
            <Button size="sm" onClick={applyLink}>
              {href.trim() ? t('linkApply') : t('linkRemove')}
            </Button>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      {prompts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-caps">{t('prompts')}</span>
          {prompts.map((prompt) => (
            <Chip
              key={prompt}
              variant="add"
              className="min-h-10 text-sm"
              aria-label={t('addPrompt', { prompt })}
              onClick={() => insertPrompt(prompt)}
            >
              {prompt}
            </Chip>
          ))}
        </div>
      )}
    </div>
  )
}
