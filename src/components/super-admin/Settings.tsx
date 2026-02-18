"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        ai_generation_enabled: true,
        openai_api_key: '',
        google_client_id: '',
        stripe_secret_key: '',
        stripe_publishable_key: '',
        stripe_webhook_secret: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data) {
                setSettings(res.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings', settings);
            toast.success('Settings updated successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                    <Key size={20} />
                    System Settings & API Keys
                </h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 space-y-8">
                    {/* AI Configuration */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">AI Capabilities</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border border-gray-100 p-4 rounded-lg bg-gray-50/50">
                                <div>
                                    <h4 className="font-medium text-gray-900">Enable AI Generation</h4>
                                    <p className="text-sm text-gray-500">Allow users to generate business descriptions using AI.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="ai_generation_enabled"
                                        checked={settings.ai_generation_enabled}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                                <input
                                    type="password"
                                    name="openai_api_key"
                                    value={settings.openai_api_key || ''}
                                    onChange={handleChange}
                                    placeholder="sk-proj-..."
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave empty to use server environment variables.</p>
                            </div>
                        </div>
                    </div>

                    {/* Google Configuration */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Google & Authentication</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Google Client ID</label>
                                <input
                                    type="text"
                                    name="google_client_id"
                                    value={settings.google_client_id || ''}
                                    onChange={handleChange}
                                    placeholder="...apps.googleusercontent.com"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stripe Configuration */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Stripe Payments</h3>
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Secret Key</label>
                                <input
                                    type="password"
                                    name="stripe_secret_key"
                                    value={settings.stripe_secret_key || ''}
                                    onChange={handleChange}
                                    placeholder="sk_test_..."
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Publishable Key</label>
                                <input
                                    type="text"
                                    name="stripe_publishable_key"
                                    value={settings.stripe_publishable_key || ''}
                                    onChange={handleChange}
                                    placeholder="pk_test_..."
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Webhook Secret</label>
                                <input
                                    type="password"
                                    name="stripe_webhook_secret"
                                    value={settings.stripe_webhook_secret || ''}
                                    onChange={handleChange}
                                    placeholder="whsec_..."
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 bg-accent-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                    >
                        {saving ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
