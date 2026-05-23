'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, MapPin, Tag, Star, Image as ImageIcon, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function ManageHotels() {
    const [hotels, setHotels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        category: '',
        price_per_night: '',
        rating: '0',
        amenities: '',
        images: ''
    })

    useEffect(() => {
        fetchHotels()
    }, [])

    const fetchHotels = async () => {
        setLoading(true)
        const { data } = await supabase.from('hotels').select('*').order('created_at', { ascending: false })
        setHotels(data || [])
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this hotel?')) return
        await supabase.from('hotels').delete().eq('id', id)
        fetchHotels()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { error } = await supabase.from('hotels').insert([{
                ...formData,
                price_per_night: parseFloat(formData.price_per_night),
                rating: parseFloat(formData.rating)
            }])
            if (error) throw error
            setIsModalOpen(false)
            setFormData({
                name: '',
                description: '',
                location: '',
                category: '',
                price_per_night: '',
                rating: '0',
                amenities: '',
                images: ''
            })
            fetchHotels()
        } catch (error) {
            console.error('Error saving hotel:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Manage Hotels</h1>
                    <p className="text-gray-400 mt-1">Add, edit, or remove hotels from your platform</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-admin flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add New Hotel
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-accent-admin" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <div key={hotel.id} className="card-premium overflow-hidden group">
                            <div className="relative h-56">
                                <img
                                    src={hotel.images.split(',')[0]}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    alt={hotel.name}
                                />
                                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                                    <Star size={14} className="text-accent-admin fill-accent-admin" />
                                    <span className="text-white text-sm font-bold">{hotel.rating}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(hotel.id)}
                                    className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 bg-accent-admin/10 text-accent-admin text-[10px] font-bold uppercase tracking-wider rounded-full border border-accent-admin/20">
                                        {hotel.category}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white">{hotel.name}</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1 mb-4">
                                    <MapPin size={14} />
                                    <span>{hotel.location}</span>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                                    {hotel.description}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div>
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-tight">Price Nightly</p>
                                        <p className="text-white text-xl font-bold">${hotel.price_per_night}</p>
                                    </div>
                                    <button className="p-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                                        <ImageIcon size={20} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {hotels.length === 0 && (
                        <div className="col-span-full py-20 text-center card-premium">
                            <p className="text-gray-500">No hotels found. Start by adding one!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Hotel Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Hotel"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-gray-400 ml-1">Hotel Name</label>
                            <input
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-gray-400 ml-1">Category</label>
                            <select
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50 appearance-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Resort">Resort</option>
                                <option value="Boutique">Boutique</option>
                                <option value="Business">Business</option>
                            </select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Location</label>
                            <input
                                required
                                placeholder="City, Country"
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Description</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-gray-400 ml-1">Price per Night ($)</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.price_per_night}
                                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-gray-400 ml-1">Rating (1-5)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                required
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Amenities (comma separated)</label>
                            <input
                                required
                                placeholder="WiFi, Pool, Spa, Gym"
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.amenities}
                                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Images (comma separated URLs)</label>
                            <input
                                required
                                placeholder="https://example.com/image1.jpg, ..."
                                className="w-full bg-[#0F1117] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-admin/50"
                                value={formData.images}
                                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full btn-admin h-12 flex items-center justify-center gap-2 mt-4"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : 'Create Hotel'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}
