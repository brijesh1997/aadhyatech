"use client"

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function PlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/plans/admin/all'); // Assuming this is the admin route based on controller
            setPlans(res.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/plans/${id}`);
                setPlans(plans.filter((plan: any) => plan.id !== id));
                Swal.fire('Deleted!', 'Plan has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete plan.', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">Subscription Plans</h1>
                    <p className="text-gray-500">Manage your pricing and features</p>
                </div>
                <Link
                    href="/super-admin/plans/new"
                    className="bg-dark-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-colors"
                >
                    <Plus size={18} />
                    Add New Plan
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price (USD)</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Interval</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Popular</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {plans.map((plan: any) => (
                            <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-dark-900">{plan.name}</td>
                                <td className="px-6 py-4 text-gray-600">${plan.price_usd}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase">
                                        {plan.interval}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {plan.is_popular ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${plan.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/super-admin/plans/${plan.id}`}
                                            className="p-2 text-gray-500 hover:text-accent-blue hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {plans.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No plans found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
