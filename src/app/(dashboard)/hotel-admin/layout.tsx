'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    DoorOpen,
    History,
    Bell,
    LogOut,
    Menu,
    X,
    User,
    Hotel
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const navigation = [
    { name: 'Overview', href: '/hotel-admin', icon: LayoutDashboard },
    { name: 'Rooms & Availability', href: '/hotel-admin/rooms', icon: DoorOpen },
    { name: 'Booking History', href: '/hotel-admin/history', icon: History },
]

export default function HotelAdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [hotel, setHotel] = useState<any>(null)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            router.push('/login')
            return
        }
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.role !== 'Hotel Admin') {
            router.push('/login')
            return
        }
        setUser(parsedUser)
        fetchHotelName(parsedUser.hotel_id)
    }, [router])

    const fetchHotelName = async (hotelId: string) => {
        if (!hotelId) return
        const { data } = await supabase.from('hotels').select('name').eq('id', hotelId).single()
        setHotel(data)
    }

    const handleLogout = () => {
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-[#0F1117] flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-[260px] flex-col border-r border-white/5 bg-[#1A1D2E] fixed h-full">
                <div className="p-8">
                    <div className="flex items-center gap-3 text-accent-staff">
                        <Hotel size={28} strokeWidth={2.5} />
                        <span className="text-xl font-bold tracking-tight text-white">Staff <span className="text-accent-staff">Workspace</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "sidebar-item text-gray-400",
                                pathname === item.href && "sidebar-item-active-staff"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full sidebar-item text-gray-400 hover:text-red-400 hover:bg-red-400/5"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Mobile */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-[280px] bg-[#1A1D2E] z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-accent-staff">
                        <Hotel size={24} />
                        <span className="text-lg font-bold text-white">Staff Workspace</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400">
                        <X size={24} />
                    </button>
                </div>
                <nav className="px-4 mt-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={cn(
                                "sidebar-item text-gray-400",
                                pathname === item.href && "sidebar-item-active-staff"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-[260px] flex flex-col">
                {/* Topbar */}
                <header className="h-20 border-b border-white/5 bg-[#0F1117]/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-gray-400"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{hotel?.name || 'Staff Panel'}</h2>
                            <p className="text-white text-lg font-bold">Property Management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-staff rounded-full" />
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-white text-sm font-bold">{user.name}</p>
                                <p className="text-accent-staff text-xs font-medium uppercase">Hotel Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-accent-staff/20 flex items-center justify-center text-accent-staff">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
