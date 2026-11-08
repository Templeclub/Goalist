import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

/** The restricted schema of D-008, shared by the editor and its schema test. */
export function editorExtensions(placeholder = '') {
  return [
    StarterKit.configure({
      heading: { levels: [3] },
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      underline: false,
      link: {
        openOnClick: false,
        autolink: true,
        protocols: ['mailto'],
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      },
    }),
    Placeholder.configure({ placeholder }),
  ]
}
