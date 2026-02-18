"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Loader2, ArrowLeft, Mail, Calendar, Shield, CreditCard, Building, MapPin, Globe, Phone, History } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function UserDetailsPage() {
    const params = useParams()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [previewUrlModalOpen, setPreviewUrlModalOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState("")

    useEffect(() => {
        if (params.id) {
            fetchUser()
        }
    }, [params.id])

    const fetchUser = async () => {
        try {
            const res = await api.get(`/super-admin/users/${params.id}`)
            setUser(res.data)
            if (res.data.business_profile?.preview_url) {
                setPreviewUrl(res.data.business_profile.preview_url)
            }
        } catch (error) {
            console.error('Error fetching user:', error)
            toast.error("Failed to load user details")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === 'Ready to Launch' && !user.business_profile?.preview_url) {
            setPreviewUrlModalOpen(true)
            return
        }
        updateStatus(newStatus)
    }

    const updateStatus = async (status: string, url?: string) => {
        setUpdatingStatus(true)
        try {
            await api.put(`/super-admin/users/${params.id}`, {
                business_profile: {
                    website_status: status,
                    ...(url && { preview_url: url })
                }
            })
            toast.success("Status updated successfully")
            setPreviewUrlModalOpen(false)
            fetchUser() // Refresh data
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error("Failed to update status")
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handlePreviewUrlSubmit = () => {
        if (!previewUrl) {
            toast.error("Please enter a preview URL")
            return
        }
        updateStatus('Ready to Launch', previewUrl)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-500 mb-4">User not found</p>
                <Link href="/super-admin/users" className="text-accent-blue hover:underline">
                    Back to Users
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/super-admin/users"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl uppercase relative overflow-hidden">
                        {user.business_profile?.logo_url ? (
                            <img src={user.business_profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            (user.first_name?.[0] || user.email[0])
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.first_name || 'No Name'} {user.last_name || ''}</h2>
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center text-gray-500 text-sm">
                                <Mail size={14} className="mr-2" />
                                {user.email}
                            </div>
                            {user.mobile && (
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Phone size={14} className="mr-2" />
                                    {user.mobile}
                                </div>
                            )}
                            {(user.city || user.state || user.country) && (
                                <div className="flex items-center text-gray-500 text-sm">
                                    <MapPin size={14} className="mr-2" />
                                    {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                        <select
                            value={user.business_profile?.website_status || 'In Review'}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updatingStatus}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border outline-none
                                ${user.business_profile?.website_status === 'Ready to Launch' ? 'bg-green-50 text-green-700 border-green-200' :
                                    user.business_profile?.website_status === 'In Development' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                        >
                            <option value="In Review">In Review</option>
                            <option value="In Development">In Development</option>
                            <option value="Ready to Launch">Ready to Launch</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2
                            ${user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            <Shield size={12} />
                            {user.role.replace('_', ' ')}
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-100 flex items-center gap-2">
                            <Calendar size={12} />
                            Joined {new Date(user.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview URL Modal */}
            {previewUrlModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Enter Preview URL</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Provide the URL where the user can preview their website.
                            </p>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue/50 outline-none"
                                value={previewUrl}
                                onChange={(e) => setPreviewUrl(e.target.value)}
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setPreviewUrlModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePreviewUrlSubmit}
                                className="px-4 py-2 text-sm font-medium bg-accent-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Set Live
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Business Profile */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <Building size={18} className="text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Business Profile</h3>
                    </div>
                    <div className="p-6">
                        {user.business_profile ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Business Name</span>
                                        <p className="text-gray-900 font-medium">{user.business_profile.business_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Industry</span>
                                        <p className="text-gray-900">{user.business_profile.industry}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Description</span>
                                    <p className="text-gray-700 text-sm leading-relaxed">{user.business_profile.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Website Goal</span>
                                        <p className="text-gray-900 text-sm">{user.business_profile.website_goal}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Target Audience</span>
                                        <p className="text-gray-900 text-sm">{user.business_profile.target_audience}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Contact Email</span>
                                        <p className="text-gray-900 text-sm sm:truncate" title={user.business_profile.contact_email || ''}>
                                            {user.business_profile.contact_email || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Contact Phone</span>
                                        <p className="text-gray-900 text-sm">
                                            {user.business_profile.contact_phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Primary Color</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded border border-gray-200 shadow-sm" style={{ backgroundColor: user.business_profile.primary_color || '#ffffff' }}></div>
                                            <p className="text-gray-900 text-sm">{user.business_profile.primary_color || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Secondary Color</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded border border-gray-200 shadow-sm" style={{ backgroundColor: user.business_profile.secondary_color || '#ffffff' }}></div>
                                            <p className="text-gray-900 text-sm">{user.business_profile.secondary_color || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Selected Plan</span>
                                        <p className="text-gray-900 text-sm font-semibold">
                                            {user.business_profile.selected_plan || 'None'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Payment Status</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase
                                            ${user.business_profile.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                user.business_profile.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'}`}>
                                            {user.business_profile.payment_status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 italic">
                                No business profile provided.
                            </div>
                        )}
                    </div>
                </div>

                {/* Subscriptions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Subscriptions</h3>
                    </div>
                    <div className="p-6">
                        {user.subscriptions && user.subscriptions.length > 0 ? (
                            <div className="space-y-4">
                                {user.subscriptions.map((sub: any) => (
                                    <div key={sub.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{sub.plan?.name || 'Unknown Plan'}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {sub.interval === 'YEARLY' ? 'Annual' : 'Monthly'} Billing
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase
                                                ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between text-sm">
                                            <span className="text-gray-500">Started: {new Date(sub.created_at).toLocaleDateString()}</span>
                                            <span className="text-gray-500">Ends: {new Date(sub.current_period_end).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {user.business_profile?.selected_plan ? (
                                    user.business_profile.payment_status === 'Paid' ? (
                                        <div className="border border-green-200 rounded-lg p-4 bg-green-50/30">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{user.business_profile.selected_plan}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        Active Plan
                                                    </p>
                                                </div>
                                                <span className="px-2 py-0.5 rounded text-xs font-medium uppercase bg-green-100 text-green-700">
                                                    PAID
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t border-green-100 mt-2 text-sm text-gray-500">
                                                <p>User has completed payment. Subscription record might be syncing.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50/30">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{user.business_profile.selected_plan}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        Pending Subscription
                                                    </p>
                                                </div>
                                                <span className="px-2 py-0.5 rounded text-xs font-medium uppercase bg-yellow-100 text-yellow-700">
                                                    PENDING
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t border-yellow-100 mt-2 text-sm text-gray-500">
                                                <p>User has selected a plan but has not completed payment yet.</p>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-8 text-gray-500 italic">
                                        No active subscriptions.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <History size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Payment ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {user.transactions && user.transactions.length > 0 ? (
                                user.transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 text-gray-500">
                                            {new Date(tx.created_at).toLocaleDateString()}
                                            <span className="text-xs text-gray-400 ml-1">
                                                {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                ${tx.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-mono text-xs text-gray-500" title={tx.stripe_payment_id}>
                                            {tx.stripe_payment_id ? tx.stripe_payment_id.split('_').slice(-1)[0] : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                                        No transactions found.
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
