"use client"

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PreviewPage() {
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchPreviewUrl = async () => {
            try {
                const res = await api.get('/users/profile');
                if (res.data.preview_url) {
                    setPreviewUrl(res.data.preview_url);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreviewUrl();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        );
    }

    if (!previewUrl) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">No Preview Available</h1>
                    <p className="text-gray-500 mb-6">Your website is not ready for preview yet.</p>
                    <Link href="/dashboard" className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <h1 className="font-bold text-gray-900">Website Preview</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live Preview
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                // We need to fetch the profile to get the selected plan, 
                                // or we can pass it via URL/context. 
                                // Since we fetch profile in this component, we can use previewUrl logic 
                                // but we don't store the full profile object in state currently.
                                // Let's quickly fetch profile or store it.
                                const res = await api.get('/users/profile');
                                const planName = res.data.selected_plan;

                                const checkoutRes = await api.post('/subscription/create-checkout-session', {
                                    planName: planName
                                });
                                window.location.href = checkoutRes.data.url;
                            } catch (error) {
                                console.error('Publish error:', error);
                            }
                        }}
                        className="bg-dark-900 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md flex items-center gap-2"
                    >
                        <span>Publish Now</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>

                </div>
            </header>

            {/* Iframe Container */}
            <div className="flex-1 overflow-hidden relative bg-gray-200 p-4">
                <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
                    <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Website Preview"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                </div>
            </div>
        </div>
    );
}
