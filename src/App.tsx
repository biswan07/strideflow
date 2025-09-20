import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { AuthForm } from './components/AuthForm'
import { Dashboard } from './components/Dashboard'
import { ProfilePage } from './components/ProfilePage'

function App() {
  const { user, loading, signUp, signIn } = useAuth()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard')

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
  }

  const navigateToProfile = () => {
    setCurrentPage('profile')
  }

  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white mt-4 text-center">Loading StrideFlow...</p>
        </div>
      </div>
    )
  }

  if (user) {
    if (currentPage === 'profile') {
      return <ProfilePage onBack={navigateToDashboard} />
    }
    return <Dashboard onNavigateToProfile={navigateToProfile} />
  }

  return (
    <AuthForm
      mode={authMode}
      onSubmit={authMode === 'signup' ? signUp : signIn}
      onToggleMode={toggleAuthMode}
      loading={loading}
    />
  )
}

export default App