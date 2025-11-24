'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api'

export default function AdminResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [resetForm, setResetForm] = useState({
    password: '',
    confirmPassword: ''
  })

  const token = searchParams.get('token')
  const phone = searchParams.get('phone')

  useEffect(() => {
    if (!token || !phone) {
      toast.error('Invalid reset link. Please request a new password reset.')
      router.push('/admin')
    }
  }, [token, phone, router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetForm.password || !resetForm.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (resetForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL.replace('/api', '')}${API_ENDPOINTS.AUTH.ADMIN_RESET_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          token, 
          password: resetForm.password 
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSuccess(true)
        toast.success('Password reset successfully!')
        setTimeout(() => {
          router.push('/admin')
        }, 3000)
      } else {
        toast.error(data.error || 'Failed to reset password')
      }
    } catch (error: any) {
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !phone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Reset Link</h1>
          <p className="text-green-600/80 mb-4">The password reset link is invalid or has expired.</p>
          <Button onClick={() => router.push('/admin')} className="bg-green-600 hover:bg-green-700">
            Go to Admin Login
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-3">Password Reset Successfully!</h1>
          <p className="text-green-600/80 text-lg mb-6">Your admin password has been updated.</p>
          <p className="text-green-600/60 text-sm">Redirecting to admin login in a few seconds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-3">Reset Password</h1>
          <p className="text-green-600/80 text-lg">Create a new password for your admin account</p>
          <p className="text-green-600/60 text-sm mt-2">Phone: {phone}</p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white/90 backdrop-blur-xl border border-green-200/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-green-800">New Password</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-12 h-12 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 text-green-900 placeholder:text-green-400 rounded-xl transition-all duration-300 text-base"
                  value={resetForm.password}
                  onChange={(e) => setResetForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-green-600 hover:text-green-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-green-800">Confirm New Password</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pl-12 h-12 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 text-green-900 placeholder:text-green-400 rounded-xl transition-all duration-300 text-base"
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-green-600 hover:text-green-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-base h-12" 
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
              >
                Back to Admin Login
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-600 text-center">
              🔒 Your new password will be securely encrypted and stored.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-green-600/60 text-sm">
            This link will expire in 1 hour for security
          </p>
        </div>
      </div>
    </div>
  )
}