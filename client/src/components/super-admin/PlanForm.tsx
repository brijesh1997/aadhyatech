"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface PlanFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function PlanForm({ initialData, isEdit = false }: PlanFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price_inr: '',
        price_usd: '',
        interval: 'MONTHLY',
        features: [''],
        is_popular: false,
        stripe_price_id_inr: '',
        stripe_price_id_usd: '',
        is_active: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                price_inr: initialData.price_inr || '',
                price_usd: initialData.price_usd || '',
                interval: initialData.interval || 'MONTHLY',
                features: initialData.features && Array.isArray(initialData.features) && initialData.features.length > 0 ? initialData.features : [''],
                is_popular: initialData.is_popular || false,
                stripe_price_id_inr: initialData.stripe_price_id_inr || '',
                stripe_price_id_usd: initialData.stripe_price_id_usd || '',
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clean up features (remove empty strings)
            const cleanedFeatures = formData.features.filter(f => f.trim() !== '');
            const payload = {
                ...formData,
                price_usd: parseFloat(formData.price_usd as string),
                features: cleanedFeatures
            };
            // Remove price_inr from payload to let backend handle it
            delete (payload as any).price_inr;

            if (isEdit && initialData?.id) {
                await api.put(`/plans/${initialData.id}`, payload);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Plan updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await api.post('/plans', payload);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Plan created successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            router.push('/super-admin/plans');
        } catch (error: any) {
            console.error('Error saving plan:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.error || 'Failed to save plan'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Plan Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
                            placeholder="e.g. Starter"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                        <select
                            name="interval"
                            value={formData.interval}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                        <input
                            type="number"
                            name="price_usd"
                            value={formData.price_usd}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
                            placeholder="e.g. 40"
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center space-x-3">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={formData.is_popular}
                        onClick={() => setFormData(prev => ({ ...prev, is_popular: !prev.is_popular }))}
                        className={`${formData.is_popular ? 'bg-accent-blue' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2`}
                    >
                        <span
                            className={`${formData.is_popular ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                    <span className="text-gray-700 font-medium cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_popular: !prev.is_popular }))}>
                        Mark as Popular Plan
                    </span>
                </div>

                <div className="mt-4 flex items-center space-x-3">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={formData.is_active}
                        onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                        className={`${formData.is_active ? 'bg-accent-blue' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2`}
                    >
                        <span
                            className={`${formData.is_active ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                    <span className="text-gray-700 font-medium cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}>
                        Is Active?
                    </span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Features</h2>
                    <button
                        type="button"
                        onClick={addFeature}
                        className="text-sm text-accent-blue font-bold hover:text-blue-700 flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Feature
                    </button>
                </div>
                <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
                                placeholder={`Feature ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeFeature(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>



            <div className="flex justify-end gap-4">
                <Link
                    href="/super-admin/plans"
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-dark-900 text-white font-bold rounded-lg hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Plan
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
