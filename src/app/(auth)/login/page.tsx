'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Hotel, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // In a real app with Supabase Auth, you'd use supabase.auth.signInWithPassword
            // But the user asked for a custom 'users' table check.
            // Let's assume we are just checking the 'users' table directly for this demo,
            // though typically Supabase Auth is preferred.
            // If we use Supabase Auth, we'd still need to query the 'users' table for the role.

            const { data: user, error: queryError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password) // NOTE: In production, password should be hashed!
                .single()

            if (queryError || !user) {
                throw new Error('Invalid email or password')
            }

            // Store user info in localStorage for this demo (instead of sessions/cookies for simplicity)
            localStorage.setItem('user', JSON.stringify(user))

            if (user.role === 'Admin') {
                router.push('/admin')
            } else if (user.role === 'Hotel Admin') {
                router.push('/hotel-admin')
            } else {
                setError('Access denied. You do not have admin privileges.')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F1117]">
            <div className="w-full max-w-md">
                <div className="text-center mb-10 translate-y-[-20px] animate-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-admin/10 text-accent-admin mb-4">
                        <Hotel size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
                    <p className="text-gray-400 mt-2">Sign in to manage your bookings</p>
                </div>

                <form onSubmit={handleLogin} className="card-premium p-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm animate-in">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50 transition-all"
                                placeholder="admin@hotel.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-admin h-12 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-8">
                    Need help? <a href="#" className="text-accent-admin hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    )
}
