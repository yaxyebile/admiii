'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, DoorOpen, BadgeDollarSign, Info, Loader2, Image as ImageIcon } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

export default function RoomManagement() {
    const [rooms, setRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)

    const [formData, setFormData] = useState({
        room_number: '',
        type: '',
        price: '',
        description: '',
        images: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800' // Default high-end room image
    })

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            fetchRooms(parsedUser.hotel_id)
        }
    }, [])

    const fetchRooms = async (hotelId: string) => {
        setLoading(true)
        const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('room_number', { ascending: true })
        setRooms(data || [])
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this room permanently?')) return
        await supabase.from('rooms').delete().eq('id', id)
        fetchRooms(user.hotel_id)
    }

    const toggleStatus = async (id: string, currentStatus: number) => {
        const newStatus = currentStatus === 0 ? 1 : 0
        await supabase.from('rooms').update({ status: newStatus }).eq('id', id)
        fetchRooms(user.hotel_id)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { error } = await supabase.from('rooms').insert([{
                ...formData,
                hotel_id: user.hotel_id,
                price: parseFloat(formData.price),
                status: 0 // Default Available
            }])
            if (error) throw error
            setIsModalOpen(false)
            setFormData({
                room_number: '',
                type: '',
                price: '',
                description: '',
                images: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800'
            })
            fetchRooms(user.hotel_id)
        } catch (error) {
            console.error('Error saving room:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Rooms & Availability</h1>
                    <p className="text-gray-400 mt-1">Manage your hotel's inventory and real-time status</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-staff flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add New Room
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-accent-staff" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="card-premium overflow-hidden group">
                            <div className="relative h-48">
                                <img
                                    src={room.images.split(',')[0]}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    alt={room.room_number}
                                />
                                <div className={cn(
                                    "absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md",
                                    room.status === 0
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : "bg-red-500/20 text-red-400 border-red-500/30"
                                )}>
                                    {room.status === 0 ? 'Available' : 'Occupied'}
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(room.id, room.status)}
                                        className="p-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-xl transition-all"
                                        title="Toggle Occupancy"
                                    >
                                        <Info size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(room.id)}
                                        className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-4xl font-black text-white italic tracking-tighter">#{room.room_number}</h3>
                                        <p className="text-accent-staff text-xs font-bold uppercase tracking-widest mt-1">{room.type}</p>
                                    </div>
                                </div>

                                <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10">
                                    {room.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-white">
                                        <BadgeDollarSign size={20} className="text-accent-staff" />
                                        <span className="text-2xl font-bold">{room.price}</span>
                                        <span className="text-gray-500 text-[10px] uppercase font-medium">/ night</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {rooms.length === 0 && (
                        <div className="col-span-full py-20 text-center card-premium border-dashed">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DoorOpen className="text-gray-600" size={32} />
                            </div>
                            <p className="text-gray-500">No rooms listed for this hotel. Click 'Add New Room' to begin.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Room Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Room"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-gray-400 ml-1">Room Number</label>
                            <input
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-staff/50"
                                value={formData.room_number}
                                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-gray-400 ml-1">Room Type</label>
                            <select
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-staff/50 appearance-none"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Select Type</option>
                                <option value="Single Standard">Single Standard</option>
                                <option value="Double Deluxe">Double Deluxe</option>
                                <option value="King Suite">King Suite</option>
                                <option value="Executive Suite">Executive Suite</option>
                                <option value="Presidential Suite">Presidential Suite</option>
                            </select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Price per Night ($)</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-staff/50"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Description</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-staff/50 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    required
                                    className="flex-1 bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-staff/50"
                                    value={formData.images}
                                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                />
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                                    <img src={formData.images} className="w-full h-full object-cover" alt="preview" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full btn-staff h-12 flex items-center justify-center gap-2 mt-4"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : 'Add Room to Inventory'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}
