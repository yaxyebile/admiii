'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Check, X, User, DoorOpen, Calendar, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BookingHistory() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            fetchBookings(parsedUser.hotel_id)
        }
    }, [])

    const fetchBookings = async (hotelId: string) => {
        setLoading(true)
        const { data } = await supabase
            .from('bookings')
            .select('*, rooms(room_number), users(name)')
            .eq('hotel_id', hotelId)
            .order('created_at', { ascending: false })

        setBookings(data || [])
        setLoading(false)
    }

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('bookings').update({ status }).eq('id', id)
        fetchBookings(user.hotel_id)
    }

    const filteredBookings = bookings.filter(b =>
        b.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.rooms?.room_number?.toLowerCase().includes(search.toLowerCase()) ||
        b.status.toLowerCase().includes(search.toLowerCase())
    )

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: any = {
            'Pending': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            'Approved': 'bg-green-500/10 text-green-500 border-green-500/20',
            'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
            'Cancelled': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        }
        return (
            <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest", styles[status])}>
                {status}
            </span>
        )
    }

    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Booking History</h1>
                    <p className="text-gray-400 mt-1">Manage and review all reservation requests for your hotel</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    placeholder="Filter by guest name, room number, or status..."
                    className="w-full bg-[#1A1D2E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-staff/30 shadow-xl transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-accent-staff" size={40} />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="card-premium p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors">
                            <div className="flex flex-wrap items-center gap-6 lg:gap-12">
                                {/* Guest Info */}
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 rounded-full bg-accent-staff/10 flex items-center justify-center text-accent-staff">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{booking.users?.name}</p>
                                        <p className="text-gray-500 text-xs">Guest Account</p>
                                    </div>
                                </div>

                                {/* Room Info */}
                                <div className="flex items-center gap-3">
                                    <DoorOpen className="text-gray-600" size={20} />
                                    <div>
                                        <p className="text-white text-sm font-semibold">Room {booking.rooms?.room_number || 'N/A'}</p>
                                        <p className="text-gray-500 text-xs font-medium">Standard Type</p>
                                    </div>
                                </div>

                                {/* Check-in Info */}
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-gray-600" size={20} />
                                    <div>
                                        <p className="text-white text-sm font-semibold">{booking.check_in}</p>
                                        <p className="text-gray-500 text-xs font-medium">To {booking.check_out}</p>
                                    </div>
                                </div>

                                {/* Status & Price */}
                                <div className="flex items-center gap-6">
                                    <StatusBadge status={booking.status} />
                                    <div className="text-right">
                                        <p className="text-white font-bold">${booking.total_price}</p>
                                        <p className="text-gray-600 text-[10px] uppercase font-bold tracking-tighter">Total Amount</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                <button
                                    onClick={() => updateStatus(booking.id, 'Approved')}
                                    disabled={booking.status === 'Approved'}
                                    className="flex-1 lg:flex-none btn-staff bg-green-500 hover:bg-green-600 flex items-center gap-2 py-2"
                                >
                                    <Check size={18} />
                                    Approve
                                </button>
                                <button
                                    onClick={() => updateStatus(booking.id, 'Rejected')}
                                    disabled={booking.status === 'Rejected'}
                                    className="flex-1 lg:flex-none btn-staff bg-red-500 hover:bg-red-600 flex items-center gap-2 py-2"
                                >
                                    <X size={18} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredBookings.length === 0 && (
                        <div className="py-20 text-center card-premium">
                            <p className="text-gray-500 font-medium">No reservation records found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
