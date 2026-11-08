import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from './Sheet'

const meta = {
  title: 'Composants/Sheet',
  component: SheetContent,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SheetContent>

export default meta
type Story = StoryObj<typeof meta>

export const Capture: Story = {
  name: 'Capture express (ouverte)',
  args: { title: 'Une envie, en une phrase', full: true },
  render: (args) => (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button>J’aimerais…</Button>
      </SheetTrigger>
      <SheetContent
        {...args}
        footer={
          <SheetClose asChild>
            <Button block>Garder</Button>
          </SheetClose>
        }
      >
        <label htmlFor="express" className="sr-only">
          Ton envie
        </label>
        <textarea
          id="express"
          rows={3}
          placeholder="J’aimerais…"
          className="w-full resize-none bg-transparent font-display text-xl placeholder:text-ink-3 placeholder:italic focus-visible:outline-none"
        />
        <p className="text-[0.9375rem] text-ink-3">
          Seul le titre compte pour l’instant. Tu pourras tout préciser plus tard.
        </p>
      </SheetContent>
    </Sheet>
  ),
}
