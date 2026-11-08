import {
  Activity,
  BookOpen,
  Briefcase,
  CircleCheck,
  Compass,
  Feather,
  Footprints,
  HandHeart,
  Heart,
  HeartHandshake,
  Leaf,
  Lightbulb,
  ListChecks,
  Moon,
  Palette,
  PartyPopper,
  PiggyBank,
  Shapes,
  Sofa,
  Tent,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryKey, GoalStatus } from '@/features/goals/schema'

export const categoryIcon: Record<CategoryKey, LucideIcon> = {
  family: HeartHandshake,
  social: PartyPopper,
  travel: Tent,
  practical: ListChecks,
  finance: PiggyBank,
  sport_health: Activity,
  wellbeing: Leaf,
  home: Sofa,
  learning: Lightbulb,
  work: Briefcase,
  volunteering: HandHeart,
  creative: Palette,
  other: Shapes,
}

export const statusIcon: Record<GoalStatus, LucideIcon> = {
  idea: Feather,
  confirmed: Heart,
  preparing: Compass,
  in_progress: Footprints,
  done: CircleCheck,
  paused: Moon,
  let_go: Wind,
}

export const goalsNavIcon = BookOpen
