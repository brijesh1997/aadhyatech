"use client"

import { useEffect, useState, useRef } from "react"
import api from "@/lib/api"
import { Users, Search, MoreVertical, Loader2, Trash2, Eye, Edit } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"
import Swal from 'sweetalert2'

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [openActionId, setOpenActionId] = useState<string | null>(null)
    const actionMenuRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside or scrolling
    useEffect(() => {
        function handleScroll() {
            if (openActionId) setOpenActionId(null)
        }
        function handleClickOutside(event: MouseEvent) {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionId(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        window.addEventListener("scroll", handleScroll, true) // Capture scroll in any container
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            window.removeEventListener("scroll", handleScroll, true)
        }
    }, [openActionId])

    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })

    const toggleDropdown = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation()
        if (openActionId === userId) {
            setOpenActionId(null)
        } else {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setDropdownPos({
                top: rect.bottom + window.scrollY,
                right: window.innerWidth - rect.right - 10 // slightly offset from right edge
            })
            setOpenActionId(userId)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await api.get('/super-admin/users')
            setUsers(res.data)
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (userId: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        })

        if (result.isConfirmed) {
            try {
                await api.delete(`/super-admin/users/${userId}`)
                setUsers(users.filter(u => u.id !== userId))
                Swal.fire(
                    'Deleted!',
                    'User has been deleted.',
                    'success'
                )
            } catch (error) {
                console.error('Error deleting user:', error)
                toast.error("Failed to delete user")
            }
        }
    }

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-sm w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Website Status</th>
                                <th className="px-6 py-4">Plan / Payment</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                                    {(user.first_name?.[0] || user.email[0])}
                                                </div>
                                                <Link href={`/super-admin/users/${user.id}`} className="group cursor-pointer">
                                                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-gray-500 text-xs group-hover:text-blue-500 transition-colors">{user.email}</div>
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${user.business_profile?.website_status === 'Ready to Launch' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    user.business_profile?.website_status === 'In Development' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                {user.business_profile?.website_status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {user.business_profile?.selected_plan || 'Free'}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded w-fit
                                                    ${user.business_profile?.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                        user.business_profile?.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-500'}`}>
                                                    {user.business_profile?.payment_status || 'Unpaid'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => toggleDropdown(e, user.id)}
                                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fixed Position Dropdown Portal-like behavior */}
            {openActionId && (
                <div
                    ref={actionMenuRef}
                    style={{
                        position: 'fixed',
                        top: `${dropdownPos.top}px`,
                        right: `${dropdownPos.right}px`,
                        zIndex: 9999
                    }}
                    className="w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100"
                >
                    <Link
                        href={`/super-admin/users/${openActionId}`}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Eye size={14} className="mr-2 text-blue-500" />
                        View Profile
                    </Link>
                    <Link
                        href={`/super-admin/users/${openActionId}/edit`}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Edit size={14} className="mr-2 text-orange-500" />
                        Edit User
                    </Link>
                    <button
                        onClick={() => handleDelete(openActionId)}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={14} className="mr-2" />
                        Delete User
                    </button>
                </div>
            )}
        </div>
    )
}
