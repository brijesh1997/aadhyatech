"use client"

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Loader2, User, Building2, Palette, ArrowLeft } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setProfile(res.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                // Redirect to dashboard if profile fetch fails (e.g. not logged in)
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50">

            <DashboardHeader profile={profile} title="My Profile" />

            <div className="max-w-7xl mx-auto px-6 py-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-dark-900 transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>

            </div>

            <main className="max-w-7xl mx-auto px-6 pb-10 space-y-8">
                {/* Personal Details Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <User size={18} className="text-gray-500" />
                        <h2 className="font-bold text-gray-700">Personal Details</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Full Name</label>
                            <p className="text-gray-900 font-medium">{profile.user.first_name} {profile.user.last_name}</p>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Email Address</label>
                            <p className="text-gray-900">{profile.contact_email}</p>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Mobile Number</label>
                            <p className="text-gray-900">{profile.user.mobile || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Location</label>
                            <p className="text-gray-900">
                                {[profile.user.city, profile.user.state, profile.user.country].filter(Boolean).join(', ') || 'Not provided'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Business Profile Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <Building2 size={18} className="text-gray-500" />
                        <h2 className="font-bold text-gray-700">Business Profile</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div className="col-span-1 md:col-span-2 flex items-start gap-6">
                            {profile.logo_url ? (
                                <img
                                    src={profile.logo_url}
                                    alt="Business Logo"
                                    className="w-24 h-24 rounded-lg object-contain border border-gray-200 bg-gray-50"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                    No Logo
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Business Name</label>
                                <p className="text-xl font-bold text-dark-900 mb-1">{profile.business_name}</p>
                                <p className="text-sm text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full inline-block">
                                    {profile.industry}
                                </p>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Description</label>
                            <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Website Goal</label>
                            <p className="text-gray-900">{profile.website_goal}</p>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Target Audience</label>
                            <p className="text-gray-900">{profile.target_audience}</p>
                        </div>
                    </div>
                </div>

                {/* Branding Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <Palette size={18} className="text-gray-500" />
                        <h2 className="font-bold text-gray-700">Branding</h2>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Primary Color</label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg shadow-sm border border-gray-200"
                                    style={{ backgroundColor: profile.primary_color }}
                                />
                                <span className="font-mono text-gray-600">{profile.primary_color}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Secondary Color</label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg shadow-sm border border-gray-200"
                                    style={{ backgroundColor: profile.secondary_color }}
                                />
                                <span className="font-mono text-gray-600">{profile.secondary_color}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
