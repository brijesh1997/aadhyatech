"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
    profile: {
        business_name: string;
        industry: string;
    };
    title?: string;
}

export default function DashboardHeader({ profile, title = 'Dashboard' }: DashboardHeaderProps) {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <h1
                    className="text-xl font-bold font-display text-dark-900 cursor-pointer"
                    onClick={() => router.push('/dashboard')}
                >
                    {title}
                </h1>
                <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    <div className="flex items-center gap-4 cursor-pointer">
                        <div className="text-sm text-right">
                            <p className="font-bold text-gray-900">{profile.business_name}</p>
                            <p className="text-gray-500">{profile.industry}</p>
                        </div>
                        <div className="w-10 h-10 bg-accent-blue/10 rounded-full flex items-center justify-center text-accent-blue font-bold">
                            {profile.business_name.charAt(0)}
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full pt-2 w-48 z-50">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => router.push('/dashboard/profile')}
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
