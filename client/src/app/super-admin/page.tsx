"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, Activity, AlertCircle } from "lucide-react"
import axios from "axios"
import Link from "next/link"

const DASHBOARD_STATS = [
    { name: 'Total Users', value: '0', icon: Users, change: '+12%', changeType: 'positive' },
    { name: 'Total Revenue', value: '$0.00', icon: DollarSign, change: '+2.5%', changeType: 'positive' },
    { name: 'Active Subs', value: '0', icon: Activity, change: '+18%', changeType: 'positive' },
    { name: 'System Alerts', value: '0', icon: AlertCircle, change: '0', changeType: 'neutral' },
]

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState(DASHBOARD_STATS)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                // Reusing admin stats for now as super admin has access to everything
                const res = await axios.get('http://localhost:5001/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStats([
                    { name: 'Total Users', value: res.data.totalUsers.toString(), icon: Users, change: 'Running', changeType: 'positive' },
                    { name: 'Monthly Revenue', value: `$${res.data.monthlyRevenueUSD}`, icon: DollarSign, change: 'Estimated', changeType: 'positive' },
                    { name: 'Active Subs', value: res.data.activeSubscriptions.toString(), icon: Activity, change: 'Live', changeType: 'positive' },
                    { name: 'System Status', value: 'Healthy', icon: AlertCircle, change: 'uptime 99.9%', changeType: 'positive' },
                ])
                setLoading(false)
            } catch (error) {
                console.error("Error fetching stats:", error);
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="overflow-hidden rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <item.icon className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                                    <dd>
                                        <div className="text-lg font-bold text-gray-900">{item.value}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-bold leading-6 text-gray-900">System Overview</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Manage system-wide settings, administrators, and view global logs.</p>
                    </div>
                    <div className="mt-5">
                        <Link href="/super-admin/admins" className="inline-flex items-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                            Manage Admins
                        </Link>
                        <Link href="/super-admin/settings" className="ml-4 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                            System Settings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
