"use client"

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/dashboard/OnboardingWizard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                // Check if returning from Stripe
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    const paymentStatus = params.get('payment_status');
                    const sessionId = params.get('session_id');

                    if (paymentStatus === 'success' && sessionId) {
                        try {
                            await api.post('/subscription/verify-session', { sessionId });
                            // Clear URL params
                            window.history.replaceState({}, document.title, window.location.pathname);
                        } catch (verifyError) {
                            console.error('Payment verification failed:', verifyError);
                        }
                    }
                }

                const res = await api.get('/users/profile');
                console.log('Dashboard profile data:', res.data);
                setProfile(res.data);
            } catch (error: any) {
                // If 404, it means profile doesn't exist yet, which is fine
                if (error.response && error.response.status === 404) {
                    setProfile(null);
                } else {
                    console.error('Error fetching profile:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        checkProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        );
    }

    // If no profile, show Onboarding Wizard
    if (!profile) {
        return <OnboardingWizard />;
    }

    // Main Dashboard Content
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader profile={profile} />

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-dark-900 mb-4">Welcome back!</h2>
                        <p className="text-gray-600 mb-6">
                            We are crafting your digital presence based on your preferences. Our team will review your details and get started on your website functionality shortly.
                        </p>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h3 className="font-bold text-blue-900 mb-2">Next Steps</h3>
                            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                                <li>Review your provided business details.</li>
                                <li>Our team will contact you for a discovery call (if needed).</li>
                                <li>Relax while we build your {profile.website_goal.toLowerCase()} platform.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Quick Stats / Info */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 h-fit">
                        <h3 className="font-bold text-gray-900 mb-4">Project Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Website Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold
                                    ${profile.website_status === 'Ready to Launch' ? 'bg-green-100 text-green-800' :
                                        profile.website_status === 'In Development' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'}`}>
                                    {profile.website_status || 'In Review'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Target Launch</span>
                                <span className="text-dark-900 font-medium">TBD</span>
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Selected Plan</span>
                                    <div className="text-right">
                                        <div className="font-bold text-dark-900">{profile.selected_plan || 'None'}</div>
                                        {profile.plan_price && <div className="text-xs text-gray-500">${profile.plan_price}/mo</div>}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Payment Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                                    ${profile.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                                            'bg-orange-100 text-orange-800'}`}>
                                        {profile.payment_status || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {profile.payment_status === 'Paid' ? (
                                <button
                                    onClick={() => window.location.href = 'mailto:support@aadhyatech.com'}
                                    className="w-full mt-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span>Contact Us</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            ) : (
                                <>
                                    {profile.preview_url && (
                                        <button
                                            onClick={() => router.push('/dashboard/preview')}
                                            className="w-full mt-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Preview Website
                                        </button>
                                    )}

                                    {profile.website_status === 'Ready to Launch' && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await api.post('/subscription/create-checkout-session', {
                                                        planName: profile.selected_plan
                                                    });
                                                    window.location.href = res.data.url;
                                                } catch (error) {
                                                    console.error('Publish error:', error);
                                                }
                                            }}
                                            className="w-full mt-3 py-2 bg-dark-900 text-white rounded-lg font-medium hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <span>Publish Website</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h3 className="text-lg font-bold text-dark-900 mb-4">Your Business Details</h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h4 className="font-bold text-gray-700">Profile Overview</h4>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Business Name</label>
                                <p className="text-gray-900">{profile.business_name}</p>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Industry</label>
                                <p className="text-gray-900">{profile.industry}</p>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Contact Email</label>
                                <p className="text-gray-900">{profile.contact_email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Target Audience</label>
                                <p className="text-gray-900">{profile.target_audience || 'N/A'}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Description</label>
                                <p className="text-gray-900">{profile.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
