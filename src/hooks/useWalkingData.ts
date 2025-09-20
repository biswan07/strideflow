import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { WalkingData, WalkingStats } from '../types/walking'

export function useWalkingData(userId: string | undefined) {
  const [walkingData, setWalkingData] = useState<WalkingData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<WalkingStats>({
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    averageThisWeek: 0,
    dailyBadges: 0,
    weeklyBadges: 0,
    monthlyBadges: 0
  })

  useEffect(() => {
    if (userId) {
      fetchWalkingData()
    }
  }, [userId])

  const fetchWalkingData = async () => {
    try {
      const { data, error } = await supabase
        .from('walking_data')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      setWalkingData(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching walking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: WalkingData[]) => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 6)

    // Get last 7 days data
    const weeklyData = Array(7).fill(0)
    const weekDates = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      weekDates.push(date.toISOString().split('T')[0])
    }

    weekDates.forEach((date, index) => {
      const dayData = data.find(d => d.date === date)
      if (dayData) {
        weeklyData[index] = dayData.minutes
      }
    })

    const averageThisWeek = Math.round(weeklyData.reduce((a, b) => a + b, 0) / 7)

    // Calculate badges
    const dailyBadges = data.filter(d => d.minutes >= 30).length
    
    // Weekly badges: weeks with at least 5 days of 30+ minutes
    const weeklyBadges = calculateWeeklyBadges(data)
    
    // Monthly badges: months with at least 20 days of 30+ minutes
    const monthlyBadges = calculateMonthlyBadges(data)

    setStats({
      weeklyData,
      averageThisWeek,
      dailyBadges,
      weeklyBadges,
      monthlyBadges
    })
  }

  const calculateWeeklyBadges = (data: WalkingData[]): number => {
    const weeks = new Map<string, number>()
    
    data.forEach(d => {
      if (d.minutes >= 30) {
        const date = new Date(d.date)
        const weekKey = getWeekKey(date)
        weeks.set(weekKey, (weeks.get(weekKey) || 0) + 1)
      }
    })

    return Array.from(weeks.values()).filter(count => count >= 5).length
  }

  const calculateMonthlyBadges = (data: WalkingData[]): number => {
    const months = new Map<string, number>()
    
    data.forEach(d => {
      if (d.minutes >= 30) {
        const date = new Date(d.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        months.set(monthKey, (months.get(monthKey) || 0) + 1)
      }
    })

    return Array.from(months.values()).filter(count => count >= 20).length
  }

  const getWeekKey = (date: Date): string => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    return startOfWeek.toISOString().split('T')[0]
  }

  const addWalkingData = async (date: string, minutes: number) => {
    try {
      const { data, error } = await supabase
        .from('walking_data')
        .upsert({
          user_id: userId,
          date,
          minutes,
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error

      await fetchWalkingData() // Refresh data
      return { success: true, data }
    } catch (error) {
      console.error('Error adding walking data:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  return {
    walkingData,
    stats,
    loading,
    addWalkingData,
    refreshData: fetchWalkingData
  }
}