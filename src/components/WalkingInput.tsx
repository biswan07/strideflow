import React, { useState } from 'react'
import { Plus, Calendar, Clock, X } from 'lucide-react'

interface WalkingInputProps {
  onSubmit: (date: string, minutes: number) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

export function WalkingInput({ onSubmit, onClose }: WalkingInputProps) {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [minutes, setMinutes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!date || !minutes) {
      setError('Please fill in all fields')
      return
    }

    const minutesNum = parseInt(minutes)
    if (isNaN(minutesNum) || minutesNum < 0) {
      setError('Please enter a valid number of minutes')
      return
    }

    setIsSubmitting(true)

    const result = await onSubmit(date, minutesNum)
    
    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Failed to save walking data')
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 sm:p-6 shadow-2xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Add Walking Data</h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar className="w-5 h-5 text-white/50" />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all text-sm sm:text-base"
              disabled={isSubmitting}
            />
          </div>

          {/* Minutes Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Clock className="w-5 h-5 text-white/50" />
            </div>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Minutes walked"
              min="0"
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all text-sm sm:text-base"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-2 sm:p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 sm:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Walking Data
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}