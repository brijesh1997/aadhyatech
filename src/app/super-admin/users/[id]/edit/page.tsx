"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function EditUserPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        mobile: '',
        city: '',
        state: '',
        country: '',
        business_profile: {
            business_name: '',
            industry: '',
            description: '',
            website_goal: '',
            target_audience: '',
            contact_email: '',
            contact_phone: '',
            primary_color: '',
            secondary_color: ''
        }
    })

    useEffect(() => {
        if (params.id) {
            fetchUser()
        }
    }, [params.id])

    const fetchUser = async () => {
        try {
            const res = await api.get(`/super-admin/users/${params.id}`)
            const user = res.data
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                mobile: user.mobile || '',
                city: user.city || '',
                state: user.state || '',
                country: user.country || '',
                business_profile: {
                    business_name: user.business_profile?.business_name || '',
                    industry: user.business_profile?.industry || '',
                    description: user.business_profile?.description || '',
                    website_goal: user.business_profile?.website_goal || '',
                    target_audience: user.business_profile?.target_audience || '',
                    contact_email: user.business_profile?.contact_email || '',
                    contact_phone: user.business_profile?.contact_phone || '',
                    primary_color: user.business_profile?.primary_color || '',
                    secondary_color: user.business_profile?.secondary_color || ''
                }
            })
        } catch (error) {
            console.error('Error fetching user:', error)
            toast.error("Failed to load user details")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name.startsWith('bp_')) {
            const field = name.replace('bp_', '')
            setFormData(prev => ({
                ...prev,
                business_profile: {
                    ...prev.business_profile,
                    [field]: value
                }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put(`/super-admin/users/${params.id}`, formData)
            toast.success("User updated successfully")
            router.push(`/super-admin/users/${params.id}`)
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error("Failed to update user")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/super-admin/users/${params.id}`}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                            <input
                                type="text"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Location</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Profile */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Business Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                            <input
                                type="text"
                                name="bp_business_name"
                                value={formData.business_profile.business_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                            <input
                                type="text"
                                name="bp_industry"
                                value={formData.business_profile.industry}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="bp_description"
                                value={formData.business_profile.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website Goal</label>
                            <input
                                type="text"
                                name="bp_website_goal"
                                value={formData.business_profile.website_goal}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                            <input
                                type="text"
                                name="bp_target_audience"
                                value={formData.business_profile.target_audience}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                            <input
                                type="email"
                                name="bp_contact_email"
                                value={formData.business_profile.contact_email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                            <input
                                type="text"
                                name="bp_contact_phone"
                                value={formData.business_profile.contact_phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="bp_primary_color"
                                        value={formData.business_profile.primary_color || '#ffffff'}
                                        onChange={handleChange}
                                        className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        name="bp_primary_color"
                                        value={formData.business_profile.primary_color}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all text-sm"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="bp_secondary_color"
                                        value={formData.business_profile.secondary_color || '#ffffff'}
                                        onChange={handleChange}
                                        className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        name="bp_secondary_color"
                                        value={formData.business_profile.secondary_color}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all text-sm"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link
                        href={`/super-admin/users/${params.id}`}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} className="mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
