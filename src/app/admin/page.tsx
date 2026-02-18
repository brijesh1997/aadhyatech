"use client"

import { useEffect, useState } from "react"
import { Users, CreditCard, DollarSign, Activity } from "lucide-react"
import api from "@/lib/api"
import { motion } from "framer-motion"

// Mock data if API fails or is loading specific stats
const stats = [
    { name: 'Total Users', value: '1,234', icon: Users, change: '+12%', changeType: 'increase' }, // mock
    { name: 'Active Subscriptions', value: '845', icon: CreditCard, change: '+5.4%', changeType: 'increase' }, // mock
    { name: 'Monthly Revenue', value: '$12,345', icon: DollarSign, change: '+15.2%', changeType: 'increase' }, // mock
    { name: 'Conversion Rate', value: '24.57%', icon: Activity, change: '+3.2%', changeType: 'increase' }, // mock
]

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoading(false);
        }
    }

    // Merge real data with display structure
    const displayStats = [
        {
            name: 'Total Users',
            value: data?.totalUsers ?? '...',
            icon: Users,
            color: 'bg-blue-500'
        },
        {
            name: 'Active Subscriptions',
            value: data?.activeSubscriptions ?? '...',
            icon: CreditCard,
            color: 'bg-green-500'
        },
        {
            name: 'Monthly Revenue',
            value: data?.monthlyRevenueUSD ? `$${data.monthlyRevenueUSD}` : '...',
            icon: DollarSign,
            color: 'bg-purple-500'
        },
        {
            name: 'Active Plans',
            value: '4', // We know this or can fetch from API
            icon: Activity,
            color: 'bg-orange-500'
        },
    ]

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                <div className="text-sm text-gray-400">Welcome back, Admin</div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {displayStats.map((item, index) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative overflow-hidden rounded-lg bg-slate-900 p-5 shadow sm:px-6 sm:pt-6"
                    >
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-400">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                            <p className="text-2xl font-semibold text-white">{item.value}</p>
                        </dd>
                    </motion.div>
                ))}
            </div>

            {/* Placeholder for fetching charts or recent activity */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="bg-slate-900 p-6 rounded-lg shadow min-h-[300px]">
                    <h3 className="text-lg font-medium text-white mb-4">Revenue Overview</h3>
                    <div className="flex items-center justify-center h-full text-gray-500 border border-dashed border-slate-700 rounded">
                        [Chart Placeholder]
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-lg shadow min-h-[300px]">
                    <h3 className="text-lg font-medium text-white mb-4">Recent Subscriptions</h3>
                    <div className="flex items-center justify-center h-full text-gray-500 border border-dashed border-slate-700 rounded">
                        [List Placeholder]
                    </div>
                </div>
            </div>
        </div>
    )
}
