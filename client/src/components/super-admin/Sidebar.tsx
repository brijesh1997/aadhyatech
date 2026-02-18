"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShieldCheck,
    Settings,
    LogOut,
    Users,
    CreditCard,
    DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/super-admin/users', icon: Users },
    { name: 'Plans', href: '/super-admin/plans', icon: CreditCard },
    { name: 'Transactions', href: '/super-admin/transactions', icon: DollarSign },
    { name: 'Manage Admins', href: '/super-admin/admins', icon: ShieldCheck },
    // Add more super admin links here (e.g., System Settings, Global Users)
]

export default function SuperAdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                    Super Admin
                </h1>
            </div>

            <div className="flex-1 flex flex-col p-4 space-y-1">
                {navigation.map((item) => {
                    // Check if active: exact match OR starts with href (for sub-routes), ensuring dashboard '/' doesn't match everything
                    const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname?.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-red-50 text-red-700 shadow-sm border border-red-200"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-red-600" : "text-gray-400 group-hover:text-gray-500")} />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
