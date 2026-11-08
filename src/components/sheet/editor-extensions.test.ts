import { Editor } from '@tiptap/react'
import { describe, expect, it } from 'vitest'
import { RichDoc, richDocToText } from '@/features/goals/rich-text'
import { editorExtensions } from './editor-extensions'

describe('editor output matches the server schema', () => {
  it('everything the editor can produce is accepted by RichDoc', () => {
    const editor = new Editor({
      extensions: editorExtensions(),
      content:
        '<p>Un <strong>plateau</strong> <em>du</em> <a href="https://ign.fr">Vercors</a><br>suite</p>' +
        '<h3>Ce qui me donne envie</h3><ul><li><p>le silence</p><ul><li><p>vraiment</p></li></ul></li></ul>' +
        '<ol start="3"><li><p>un duvet</p></li></ol><p></p>',
    })
    const json = editor.getJSON()
    const parsed = RichDoc.safeParse(json)
    if (!parsed.success) console.error(JSON.stringify(json), parsed.error.issues)
    expect(parsed.success).toBe(true)
    expect(richDocToText(parsed.data)).toContain('Ce qui me donne envie')
    editor.destroy()
  })

  it('drops what the schema forbids before it ever reaches the server', () => {
    const editor = new Editor({
      extensions: editorExtensions(),
      content:
        '<h1>Grand titre</h1><blockquote>citation</blockquote><pre>code</pre><a href="javascript:alert(1)">x</a>',
    })
    expect(RichDoc.safeParse(editor.getJSON()).success).toBe(true)
    editor.destroy()
  })
})
