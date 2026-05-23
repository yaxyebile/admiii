'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const userString = localStorage.getItem('user')
    if (userString) {
      const user = JSON.parse(userString)
      if (user.role === 'Admin') {
        router.push('/admin')
      } else if (user.role === 'Hotel Admin') {
        router.push('/hotel-admin')
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent-admin border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
