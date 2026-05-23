'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserPlus, Mail, Lock, User, Hotel, Loader2, MoreVertical, ShieldCheck } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function HotelStaff() {
    const [staff, setStaff] = useState<any[]>([])
    const [hotels, setHotels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        hotel_id: ''
    })

    useEffect(() => {
        fetchStaff()
        fetchHotels()
    }, [])

    const fetchStaff = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'Hotel Admin')
            .order('created_at', { ascending: false })

        setStaff(data || [])
        setLoading(false)
    }

    const fetchHotels = async () => {
        const { data } = await supabase.from('hotels').select('id, name')
        setHotels(data || [])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { error } = await supabase.from('users').insert([{
                ...formData,
                role: 'Hotel Admin'
            }])
            if (error) throw error
            setIsModalOpen(false)
            setFormData({ name: '', email: '', password: '', hotel_id: '' })
            fetchStaff()
        } catch (error) {
            console.error('Error registering staff:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Hotel Staff</h1>
                    <p className="text-gray-400 mt-1">Manage and register staff members for specific hotels</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-admin flex items-center gap-2"
                >
                    <UserPlus size={20} />
                    Register Staff
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-accent-admin" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {staff.map((member) => (
                        <div key={member.id} className="card-premium p-6 group relative">
                            <button className="absolute top-6 right-6 text-gray-500 hover:text-white">
                                <MoreVertical size={20} />
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-accent-admin/10 flex items-center justify-center text-accent-admin">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                                    <div className="flex items-center gap-1.5 text-accent-admin text-xs font-bold uppercase tracking-widest mt-1">
                                        <ShieldCheck size={14} />
                                        <span>Hotel Admin</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <Mail size={18} className="text-gray-600" />
                                    <span>{member.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <Hotel size={18} className="text-gray-600" />
                                    <span className="text-white font-medium">
                                        {hotels.find(h => h.id === member.hotel_id)?.name || 'Unassigned'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-gray-500 text-xs">Joined {new Date(member.created_at).toLocaleDateString()}</span>
                                <button className="text-xs text-accent-admin hover:underline font-bold">Edit Profile</button>
                            </div>
                        </div>
                    ))}
                    {staff.length === 0 && (
                        <div className="col-span-full py-20 text-center card-premium">
                            <p className="text-gray-500">No staff members registered yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Register Staff Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Register New Staff"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Assign Hotel</label>
                        <div className="relative">
                            <Hotel className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <select
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50 appearance-none"
                                value={formData.hotel_id}
                                onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                            >
                                <option value="">Select Hotel</option>
                                {hotels.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full btn-admin h-12 flex items-center justify-center gap-2 mt-4"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : 'Register Staff Member'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}
