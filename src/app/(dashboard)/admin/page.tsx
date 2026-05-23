'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    TrendingUp,
    Users,
    Hotel,
    CalendarCheck,
    MoreVertical,
    Check,
    X,
    CreditCard
} from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import { cn } from '@/lib/utils'

const data = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
]

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        activeHotels: 0,
    })
    const [recentBookings, setRecentBookings] = useState<any[]>([])
    const [hotels, setHotels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            // Fetch Stats
            const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
            const { data: revenueData } = await supabase.from('bookings').select('total_price').eq('status', 'Approved')
            const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Customer')
            const { count: hotelsCount } = await supabase.from('hotels').select('*', { count: 'exact', head: true })

            const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total_price), 0) || 0

            setStats({
                totalBookings: bookingsCount || 0,
                totalRevenue,
                totalCustomers: usersCount || 0,
                activeHotels: hotelsCount || 0,
            })

            // Fetch Recent Bookings
            const { data: bookings } = await supabase
                .from('bookings')
                .select('*, hotels(name), users(name)')
                .order('created_at', { ascending: false })
                .limit(5)

            setRecentBookings(bookings || [])

            // Fetch Hotels
            const { data: hotelsData } = await supabase.from('hotels').select('*').limit(4)
            setHotels(hotelsData || [])

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateBookingStatus = async (id: string, status: string) => {
        try {
            await supabase.from('bookings').update({ status }).eq('id', id)
            fetchDashboardData()
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
        <div className="card-premium p-6 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                <p className={cn("text-xs mt-2 flex items-center gap-1", trend > 0 ? "text-green-400" : "text-red-400")}>
                    <TrendingUp size={14} className={cn(trend < 0 && "rotate-180")} />
                    <span>{Math.abs(trend)}% from last month</span>
                </p>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-opacity-20", color)}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
        </div>
    )

    return (
        <div className="space-y-8 animate-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={CalendarCheck}
                    trend={12.5}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={CreditCard}
                    trend={8.2}
                    color="bg-accent-admin"
                />
                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    icon={Users}
                    trend={5.4}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Active Hotels"
                    value={stats.activeHotels}
                    icon={Hotel}
                    trend={2.1}
                    color="bg-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 card-premium p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
                            <p className="text-gray-400 text-sm">Monthly performance overview</p>
                        </div>
                        <select className="bg-[#0F1117] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none">
                            <Option>Last 7 Days</Option>
                            <Option>Last 30 Days</Option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A1D2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#FFD700' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#FFD700"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="card-premium p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Recent Bookings</h3>
                        <button className="text-accent-admin text-sm hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {recentBookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent-admin/10 flex items-center justify-center text-accent-admin group-hover:scale-110 transition-transform">
                                        <CalendarCheck size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-bold">{booking.users?.name}</p>
                                        <p className="text-gray-500 text-xs">{booking.hotels?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => updateBookingStatus(booking.id, 'Approved')}
                                        className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => updateBookingStatus(booking.id, 'Rejected')}
                                        className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {recentBookings.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-10">No recent bookings</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hotel Directory */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Featured Hotels</h3>
                    <button className="text-accent-admin text-sm hover:underline">Manage All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hotels.map((hotel) => (
                        <div key={hotel.id} className="card-premium overflow-hidden group">
                            <div className="relative h-40">
                                <img
                                    src={hotel.images.split(',')[0]}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    alt={hotel.name}
                                />
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-accent-admin font-bold px-2 py-1 rounded-lg text-xs">
                                    ★ {hotel.rating}
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="text-white font-bold">{hotel.name}</h4>
                                <p className="text-gray-500 text-xs mt-1">{hotel.location}</p>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-white font-bold">${hotel.price_per_night}<span className="text-gray-500 text-[10px] font-normal ml-1">/ night</span></span>
                                    <button className="text-gray-400 hover:text-white transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

function Option({ children }: { children: React.ReactNode }) {
    return <option className="bg-[#1A1D2E] text-white">{children}</option>
}
