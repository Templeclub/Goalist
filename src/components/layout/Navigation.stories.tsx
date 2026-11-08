import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

const meta = {
  title: 'Navigation',
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/home' } },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Mobile: Story = {
  name: 'Barre basse (mobile)',
  parameters: { viewport: { defaultViewport: 'mobile' } },
  render: () => (
    <div className="flex h-[400px] max-w-[375px] flex-col bg-paper">
      <div className="flex-1" />
      <BottomNav />
    </div>
  ),
}

export const Desktop: Story = {
  name: 'Navigation latérale (desktop)',
  render: function Render() {
    const [collapsed, setCollapsed] = useState(false)
    return (
      <div className="flex h-[520px] bg-paper">
        <SideNav appName="Élan" collapsed={collapsed} onCollapsedChange={setCollapsed} />
      </div>
    )
  },
}
