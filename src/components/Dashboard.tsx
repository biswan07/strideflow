import React from 'react'
import { Activity, LogOut, Award, TrendingUp, Calendar, Plus, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWalkingData } from '../hooks/useWalkingData'
import { useProfile } from '../hooks/useProfile'
import { WalkingInput } from './WalkingInput'
import { useState } from 'react'

interface DashboardProps {
  onNavigateToProfile: () => void
}

export function Dashboard({ onNavigateToProfile }: DashboardProps) {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const { stats, loading, addWalkingData } = useWalkingData(user?.id)
  const [showInput, setShowInput] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const handleAddWalkingData = async (date: string, minutes: number) => {
    return await addWalkingData(date, minutes)
  }

  const weekDays = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']

  // Get the dates for the last 7 days
  const getWeekDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push({
        day: weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1], // Adjust for Monday start
        date: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        fullDate: date.toISOString().split('T')[0]
      })
    }
    return dates
  }

  const weekDatesData = getWeekDates()

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {profile?.profile_image_url ? (
                <img 
                  src={profile.profile_image_url} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
                />
              ) : (
                <img 
                  src="/logo.jpg" 
                  alt="StrideFlow Logo" 
                  className="w-12 h-12 rounded-xl object-contain"
                />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">StrideFlow</h1>
              <p className="text-white/70 text-xs sm:text-sm">
                {profile?.display_name || user?.email?.split('@')[0] || user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToProfile}
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white transition-all text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

        {/* Add Button */}
        <div className="max-w-4xl mx-auto px-6 mb-4">
          <button
            onClick={() => setShowInput(true)}
            className="w-full max-w-md mx-auto py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Walking Data
          </button>
        </div>

      {/* Main Dashboard */}
      <main className="max-w-4xl mx-auto px-6 pb-12">
          {loading ? (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl text-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Loading your walking data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Graph Section - Full Width */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6 text-center">Progress in last 7 days</h2>
            
                {/* Line Chart - Full Size */}
                <div className="h-80 relative mb-6">
                  <svg className="w-full h-full" viewBox="0 0 700 280" preserveAspectRatio="xMidYMid meet">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="100" height="56" patternUnits="userSpaceOnUse">
                          <path d="M 100 0 L 0 0 0 56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Line path */}
                      <path
                        d={`M 50 ${240 - (stats.weeklyData[0] / 60) * 200} ${stats.weeklyData.map((minutes, index) => 
                          `L ${50 + index * 100} ${240 - Math.max((minutes / 60) * 200, 8)}`
                        ).join(' ')}`}
                        fill="none"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="4"
                        className="drop-shadow-sm"
                      />
                      
                      {/* Data points */}
                      {stats.weeklyData.map((minutes, index) => (
                        <circle
                          key={index}
                          cx={50 + index * 100}
                          cy={240 - Math.max((minutes / 60) * 200, 8)}
                          r="8"
                          fill={minutes >= 30 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'}
                          stroke="white"
                          strokeWidth="3"
                          className="drop-shadow-sm"
                        />
                      ))}
                      
                      {/* Data labels */}
                      {stats.weeklyData.map((minutes, index) => (
                        <text
                          key={index}
                          x={50 + index * 100}
                          y={240 - Math.max((minutes / 60) * 200, 8) - 20}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.8)"
                          fontSize="16"
                          className="font-medium"
                        >
                          {minutes}m
                        </text>
                      ))}
                    </svg>
                  </div>
            
                {/* Week Days */}
                <div className="grid grid-cols-7 gap-4">
              {weekDatesData.map((dayData, index) => (
                <div 
                  key={dayData.fullDate}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl flex flex-col items-center justify-center p-4 h-24"
                >
                    <span className="text-white font-medium text-sm">{dayData.day}</span>
                    <span className="text-white/80 font-normal text-xs">{dayData.date}</span>
                    <span className="text-white font-semibold text-sm">{stats.weeklyData[index]}m</span>
                </div>
              ))}
                </div>
              </div>

              {/* Bottom Section - Badges and Average */}
              <div className="grid grid-cols-2 gap-6">
                {/* Badges Earned */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-white" />
                    <h3 className="text-xl font-semibold text-white">Badges Earned</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Daily Badge */}
                    <div className="text-center">
                      <div className="w-20 h-24 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl flex flex-col items-center justify-center mb-2 mx-auto relative overflow-hidden">
                        <img 
                          src="/daily.jpg" 
                          alt="Daily Badge" 
                          className="w-10 h-10 object-contain mb-1"
                        />
                        <span className="text-white text-sm font-medium absolute bottom-1">{stats.dailyBadges}</span>
                      </div>
                      <p className="text-white/80 text-sm">Daily</p>
                      <p className="text-white/60 text-xs">(count)</p>
                    </div>

                    {/* Weekly Badge */}
                    <div className="text-center">
                      <div className="w-20 h-24 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl flex flex-col items-center justify-center mb-2 mx-auto relative overflow-hidden">
                        <img 
                          src="/weekly.jpg" 
                          alt="Weekly Badge" 
                          className="w-10 h-10 object-contain mb-1"
                        />
                        <span className="text-white text-sm font-medium absolute bottom-1">{stats.weeklyBadges}</span>
                      </div>
                      <p className="text-white/80 text-sm">Weekly</p>
                      <p className="text-white/60 text-xs">(count)</p>
                    </div>

                    {/* Monthly Badge */}
                    <div className="text-center">
                      <div className="w-20 h-24 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl flex flex-col items-center justify-center mb-2 mx-auto relative overflow-hidden">
                        <img 
                          src="/monthly.jpg" 
                          alt="Monthly Badge" 
                          className="w-10 h-10 object-contain mb-1"
                        />
                        <span className="text-white text-sm font-medium absolute bottom-1">{stats.monthlyBadges}</span>
                      </div>
                      <p className="text-white/80 text-sm">Monthly</p>
                      <p className="text-white/60 text-xs">(count)</p>
                    </div>
                  </div>
                </div>

                {/* Average This Week */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl text-center">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                    <h3 className="text-xl font-semibold text-white">Avg this week</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.averageThisWeek} min</p>
                  <p className="text-white/70 text-base mt-1">
                    {stats.averageThisWeek >= 30 ? 'Great job! Keep it up!' : 'Try to reach 30 min daily'}
                  </p>
                </div>
              </div>
            </div>
          )}
      </main>
      </div>

      {/* Walking Input Modal */}
      {showInput && (
        <WalkingInput
          onSubmit={handleAddWalkingData}
          onClose={() => setShowInput(false)}
        />
      )}
    </>
  )
}