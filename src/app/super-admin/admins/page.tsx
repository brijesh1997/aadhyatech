"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Shield, Trash2, UserPlus, AlertTriangle } from "lucide-react"

interface AdminUser {
    id: string
    email: string
    role: string
    created_at: string
}

export default function ManageAdmins() {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [promoteEmail, setPromoteEmail] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/super-admin/admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins(res.data)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching admins:", error);
            setError('Failed to fetch admins')
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAdmins()
    }, [])

    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccessMsg('')
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/super-admin/admins/promote',
                { email: promoteEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPromoteEmail('')
            setSuccessMsg('User promoted to Admin successfully')
            fetchAdmins() // Refresh list
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to promote user. Ensure email exists.')
        }
    }

    const handleDemote = async (id: string) => {
        if (!confirm("Are you sure you want to remove admin privileges?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5001/api/super-admin/admins/${id}/demote`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchAdmins()
        } catch (err: any) {
            alert('Failed to demote admin')
        }
    }

    if (loading) return <div className="p-8 text-white">Loading admins...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Manage Administrators</h1>

            {/* Promote Section */}
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                <h3 className="text-lg font-medium text-white mb-4">Promote User to Admin</h3>
                <form onSubmit={handlePromote} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                            User Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={promoteEmail}
                            onChange={(e) => setPromoteEmail(e.target.value)}
                            className="block w-full rounded-md border-slate-700 bg-slate-800 text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Promote
                    </button>
                </form>
                {error && <div className="mt-3 text-red-500 text-sm flex items-center"><AlertTriangle className="h-4 w-4 mr-1" /> {error}</div>}
                {successMsg && <div className="mt-3 text-green-500 text-sm">{successMsg}</div>}
            </div>

            {/* List Section */}
            <div className="bg-slate-900 shadow overflow-hidden sm:rounded-lg border border-slate-800">
                <ul className="divide-y divide-slate-800">
                    {admins.map((admin) => (
                        <li key={admin.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50">
                            <div>
                                <p className="text-sm font-medium text-white">{admin.email}</p>
                                <p className="text-xs text-gray-500">ID: {admin.id}</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                                    {admin.role}
                                </span>
                            </div>
                            <div className="flex items-center">
                                {admin.role !== 'SUPER_ADMIN' && (
                                    <button
                                        onClick={() => handleDemote(admin.id)}
                                        className="text-red-400 hover:text-red-300 p-2"
                                        title="Remove Admin Access"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                    {admins.length === 0 && (
                        <li className="px-6 py-4 text-center text-gray-500">No admins found other than you.</li>
                    )}
                </ul>
            </div>
        </div>
    )
}
