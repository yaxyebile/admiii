'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts'
import {
    DoorOpen,
    Users,
    CalendarCheck,
    TrendingUp,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HotelAdminOverview() {
    const [user, setUser] = useState<any>(null)
    const [hotel, setHotel] = useState<any>(null)
    const [stats, setStats] = useState({
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        totalBookings: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            fetchDashboardData(parsedUser)
        }
    }, [])

    const fetchDashboardData = async (user: any) => {
        setLoading(true)
        try {
            // Fetch Hotel Info
            const { data: hotelData } = await supabase.from('hotels').select('*').eq('id', user.hotel_id).single()
            setHotel(hotelData)

            // Fetch Rooms Stats
            const { data: rooms } = await supabase.from('rooms').select('*').eq('hotel_id', user.hotel_id)
            const available = rooms?.filter(r => r.status === 0).length || 0
            const occupied = rooms?.filter(r => r.status === 1).length || 0

            // Fetch Bookings Count
            const { count: bookingsCount } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('hotel_id', user.hotel_id)

            setStats({
                totalRooms: rooms?.length || 0,
                availableRooms: available,
                occupiedRooms: occupied,
                totalBookings: bookingsCount || 0
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const chartData = [
        { name: 'Available', value: stats.availableRooms, color: '#10B981' },
        { name: 'Occupied', value: stats.occupiedRooms, color: '#EF4444' },
    ]

    if (!user || !hotel) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent-staff" size={40} />
        </div>
    )

    return (
        <div className="space-y-8 animate-in">
            <div className="card-premium p-8 bg-gradient-to-br from-[#1A1D2E] to-[#0F1117] relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white">Hello, {user.name}!</h1>
                    <p className="text-gray-400 mt-2 text-lg">Manage <span className="text-accent-staff font-semibold">{hotel.name}</span>'s operations today.</p>
                </div>
                <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-accent-staff/10 rounded-full blur-[80px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Occupancy Chart */}
                <div className="lg:col-span-1 card-premium p-8">
                    <h3 className="text-xl font-bold text-white mb-8">Room Occupancy</h3>
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A1D2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 flex justify-between px-4 pb-2">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{stats.availableRooms}</p>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Empty</p>
                        </div>
                        <div className="text-center border-x border-white/5 px-8">
                            <p className="text-2xl font-bold text-white">{stats.occupiedRooms}</p>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Occupied</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{stats.totalRooms}</p>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Total</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-premium p-8 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                <CalendarCheck size={28} />
                            </div>
                            <span className="text-green-400 text-sm font-bold flex items-center gap-1">
                                <TrendingUp size={14} /> +12%
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Total Bookings</p>
                            <h3 className="text-4xl font-bold text-white mt-1">{stats.totalBookings}</h3>
                        </div>
                    </div>

                    <div className="card-premium p-8 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-accent-staff/10 text-accent-staff">
                                <DoorOpen size={28} />
                            </div>
                            <span className="text-gray-400 text-sm font-bold">Standard</span>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Available Rooms</p>
                            <h3 className="text-4xl font-bold text-white mt-1">{stats.availableRooms}</h3>
                        </div>
                    </div>

                    <div className="card-premium p-8 md:col-span-2 bg-[#1A1D2E]/50 border-dashed">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                            <div>
                                <h4 className="text-white font-bold text-lg">Need more rooms?</h4>
                                <p className="text-gray-400 text-sm mt-1">Add new inventory to your hotel profile to increase bookings.</p>
                            </div>
                            <button
                                className="btn-staff flex items-center gap-2 whitespace-nowrap"
                                onClick={() => window.location.href = '/hotel-admin/rooms'}
                            >
                                Go to Room Management
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
