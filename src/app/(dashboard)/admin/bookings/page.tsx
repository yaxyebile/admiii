'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, X, Search, Filter, Loader2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AllBookings() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('bookings')
            .select('*, hotels(name), users(name)')
            .order('created_at', { ascending: false })

        setBookings(data || [])
        setLoading(false)
    }

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('bookings').update({ status }).eq('id', id)
        fetchBookings()
    }

    const filteredBookings = bookings.filter(b =>
        b.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.hotels?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase())
    )

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: any = {
            'Pending': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            'Approved': 'bg-green-500/10 text-green-500 border-green-500/20',
            'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
            'Cancelled': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        }
        return (
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", styles[status])}>
                {status}
            </span>
        )
    }

    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">All Bookings</h1>
                    <p className="text-gray-400 mt-1">Monitor and manage all hotel reservations across the platform</p>
                </div>
            </div>

            <div className="card-premium overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            placeholder="Search guest or hotel..."
                            className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-2 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-admin"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F1117] border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all text-sm">
                            <Filter size={16} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F1117] border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all text-sm">
                            <Calendar size={16} />
                            Date
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest & Hotel</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Check In/Out</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader2 className="animate-spin text-accent-admin inline" size={32} />
                                    </td>
                                </tr>
                            ) : filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-white font-bold">{booking.users?.name}</p>
                                        <p className="text-accent-admin text-xs">{booking.hotels?.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-300 text-sm">{booking.check_in}</p>
                                        <p className="text-gray-500 text-xs">{booking.check_out}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                        ${booking.total_price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => updateStatus(booking.id, 'Approved')}
                                                disabled={booking.status === 'Approved'}
                                                className="p-2 transition-all rounded-lg text-green-500 hover:bg-green-500 hover:text-white bg-green-500/10 disabled:opacity-30 disabled:hover:bg-green-500/10 disabled:hover:text-green-500"
                                                title="Approve"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(booking.id, 'Rejected')}
                                                disabled={booking.status === 'Rejected'}
                                                className="p-2 transition-all rounded-lg text-red-500 hover:bg-red-500 hover:text-white bg-red-500/10 disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-500"
                                                title="Reject"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No bookings found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
