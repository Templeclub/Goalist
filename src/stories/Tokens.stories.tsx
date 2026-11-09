import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CategoryPill } from '../components/goal/CategoryPill'
import { StatusPill } from '../components/goal/StatusPill'
import { toneProps } from '../components/goal/tone'
import { categoryHue } from '../features/goals/palette'
import { categoryKeys, goalStatuses } from '../features/goals/schema'

const meta = {
  title: 'Fondations/Tokens',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const colors = [
  'paper',
  'paper-2',
  'card',
  'ink',
  'ink-2',
  'ink-3',
  'line',
  'line-strong',
  'accent',
  'accent-soft',
  'accent-strong',
  'gilt',
  'danger',
] as const

export const Couleurs: Story = {
  render: () => (
    <div className="grid gap-10 bg-paper p-8">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {colors.map((name) => (
          <div key={name} className="grid gap-2">
            <span
              className="h-16 rounded-md border border-line"
              style={{ background: `var(--${name})` }}
            />
            <code className="text-sm text-ink-2">{name}</code>
          </div>
        ))}
      </div>
      <section className="grid gap-3">
        <h2 className="label-caps">Catégories (OKLCH, luminosité égale)</h2>
        <div className="flex flex-wrap gap-4">
          {categoryKeys.map((key) => (
            <div key={key} className="grid justify-items-start gap-2">
              <span
                {...toneProps(categoryHue[key])}
                className="signet h-12 w-6"
                aria-hidden="true"
              />
              <CategoryPill category={key} />
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="label-caps">Statuts</h2>
        <div className="flex flex-wrap gap-2">
          {goalStatuses.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>
      </section>
    </div>
  ),
}

export const Typographie: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-4 bg-paper p-8">
      <p className="font-display text-3xl font-bold tracking-[-0.015em]">
        Dormir une nuit à la belle étoile
      </p>
      <p className="font-display text-2xl">Bonsoir, Camille</p>
      <p className="font-display text-xl">Pourquoi c’est important pour toi ?</p>
      <p className="font-display text-lg">Apprendre le violoncelle</p>
      <p className="max-w-[65ch] text-md">
        Un plateau du Vercors en août. La chaleur qui retombe, le duvet étalé sur l’herbe sèche, et
        ce moment où les yeux s’habituent et où le ciel se remplit d’un coup.
      </p>
      <p className="text-base">Interface, 16 px : Garder · Compléter · Passer pour l’instant</p>
      <p className="text-sm text-ink-2">Aide courte, 14 px</p>
      <p className="label-caps">Libellé de section</p>
    </div>
  ),
}

export const PapierPointille: Story = {
  name: 'Papier pointillé',
  render: () => <div className="paper-dots h-80 w-full" />,
}
