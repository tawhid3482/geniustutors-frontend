'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext.next'
import { toast } from 'sonner'
import { Eye, EyeOff, Phone, Lock } from 'lucide-react'
import { ForgotPassword } from './ForgotPassword'

interface LoginFormProps {
  onSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const [loginForm, setLoginForm] = useState({
    phone: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.phone || !loginForm.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await signIn(loginForm.phone, loginForm.password)
      toast.success('Welcome back!')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-semibold text-green-800">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-green-600" />
          <Input
            id="phone"
            type="tel"
            placeholder="Your phone number"
            className="pl-10 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
            value={loginForm.phone}
            onChange={(e) => setLoginForm(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold text-green-800">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
            value={loginForm.password}
            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-green-600 hover:text-green-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <ForgotPassword>
          <Button variant="link" className="p-0 h-auto text-sm text-green-600 hover:text-green-700 font-medium">
            Forgot password?
          </Button>
        </ForgotPassword>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300" 
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  )
}
