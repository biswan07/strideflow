export interface WalkingData {
  id: string
  user_id: string
  date: string
  minutes: number
  created_at: string
  updated_at: string
}

export interface WalkingStats {
  weeklyData: number[]
  averageThisWeek: number
  dailyBadges: number
  weeklyBadges: number
  monthlyBadges: number
}