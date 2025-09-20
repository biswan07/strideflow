import React, { useState } from 'react'
import { Mail, Lock, UserPlus, LogIn, Activity } from 'lucide-react'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSubmit: (email: string, password: string) => Promise<{ error: string | null }>
  onToggleMode: () => void
  loading: boolean
}

export function AuthForm({ mode, onSubmit, onToggleMode, loading }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    const { error } = await onSubmit(email, password)
    
    if (error) {
      setError(error)
    } else if (mode === 'signup') {
      setError('')
      // Show success message for signup
      alert('Account created successfully! Please sign in.')
      onToggleMode()
    }
    
    setIsSubmitting(false)
  }

  const isSignUp = mode === 'signup'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img 
            src="/logo.jpg" 
            alt="StrideFlow Logo" 
            className="w-20 h-20 rounded-2xl mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">StrideFlow</h1>
          <p className="text-white/80 text-sm sm:text-base">Track your walking journey</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              {isSignUp ? 'Start your walking journey today' : 'Sign in to continue your progress'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-white/50" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all text-sm sm:text-base"
                disabled={loading || isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-white/50" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all text-sm sm:text-base"
                disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
              className="w-full py-3 sm:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>

            {/* Toggle Mode */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-white/80 hover:text-white transition-colors text-sm sm:text-base"
                disabled={loading || isSubmitting}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}