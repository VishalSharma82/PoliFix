/**
 * AI Priority Score — weighted formula for civic issues
 * Priority = severity_weight + (confirmed_count × 3) + recency_bonus
 * No external API needed — computed purely from existing database fields.
 */

export type Severity = 'low' | 'medium' | 'high' | 'critical'

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 40,
  high: 25,
  medium: 10,
  low: 5,
}

export interface PriorityInput {
  severity: Severity
  confirmed_count: number
  created_at: string
  ai_priority_score?: number
  location_importance?: number
}

export function computePriorityScore(problem: PriorityInput): number {
  if (problem.ai_priority_score) return problem.ai_priority_score;

  const severityScore = SEVERITY_WEIGHT[problem.severity] || 5
  const confirmationScore = Math.min((problem.confirmed_count ?? 0) * 3, 30)
  
  const locationScore = (problem.location_importance ?? 5) * 2;

  const ageMs = Date.now() - new Date(problem.created_at).getTime()
  const ageHours = ageMs / (1000 * 60 * 60)
  const ageDays = ageHours / 24;
  const recencyBonus = Math.min(ageDays * 2, 10);

  // Fallback formula if AI hasn't processed it yet
  return (severityScore * 0.4) + (confirmationScore * 0.3) + (locationScore * 0.2) + (recencyBonus * 0.1)
}

export interface PriorityLevel {
  label: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  color: string
  bgColor: string
  markerColor: string
  emoji: string
}

export function getPriorityLevel(score: number): PriorityLevel {
  if (score >= 50) return { label: 'CRITICAL', color: 'text-red-600', bgColor: 'bg-red-500/10 border-red-500/30', markerColor: '#ef4444', emoji: '🔴' }
  if (score >= 30) return { label: 'HIGH', color: 'text-orange-600', bgColor: 'bg-orange-500/10 border-orange-500/30', markerColor: '#f97316', emoji: '🟠' }
  if (score >= 15) return { label: 'MEDIUM', color: 'text-amber-600', bgColor: 'bg-amber-500/10 border-amber-500/30', markerColor: '#eab308', emoji: '🟡' }
  return { label: 'LOW', color: 'text-green-600', bgColor: 'bg-green-500/10 border-green-500/30', markerColor: '#22c55e', emoji: '🟢' }
}

/**
 * Civic Levels based on reputation_points
 */
export interface CivicLevel {
  title: string
  minPoints: number
  maxPoints: number
  emoji: string
  color: string
  bgColor: string
  borderColor: string
  nextTitle?: string
}

export const CIVIC_LEVELS: CivicLevel[] = [
  { title: 'Citizen', minPoints: 0, maxPoints: 49, emoji: '🌱', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800', borderColor: 'border-slate-200 dark:border-slate-700', nextTitle: 'Helper' },
  { title: 'Helper', minPoints: 50, maxPoints: 149, emoji: '🤝', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/30', borderColor: 'border-blue-200 dark:border-blue-800', nextTitle: 'Guardian' },
  { title: 'Guardian', minPoints: 150, maxPoints: 299, emoji: '🛡️', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/30', borderColor: 'border-purple-200 dark:border-purple-800', nextTitle: 'City Champion' },
  { title: 'City Champion', minPoints: 300, maxPoints: 499, emoji: '🏆', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/30', borderColor: 'border-amber-200 dark:border-amber-800', nextTitle: 'Urban Hero' },
  { title: 'Urban Hero', minPoints: 500, maxPoints: Infinity, emoji: '⚡', color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary/30' },
]

export function getCivicLevel(points: number): CivicLevel {
  for (let i = CIVIC_LEVELS.length - 1; i >= 0; i--) {
    if (points >= CIVIC_LEVELS[i].minPoints) return CIVIC_LEVELS[i]
  }
  return CIVIC_LEVELS[0]
}

export function getLevelProgress(points: number): number {
  const level = getCivicLevel(points)
  if (level.maxPoints === Infinity) return 100
  const range = level.maxPoints - level.minPoints + 1
  const progress = points - level.minPoints
  return Math.min(100, Math.round((progress / range) * 100))
}

/**
 * Haversine formula — distance in km between two lat/lng points
 */
export function haversineDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
