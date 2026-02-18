"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { CreditCard, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminPlans() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            const res = await api.get('/plans/admin/all');
            setPlans(res.data);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="h-6 w-6" /> Plans Management
                </h1>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-white">{plan.name}</h3>
                            {plan.is_popular && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Popular</span>}
                        </div>
                        <div className="mb-4">
                            <div className="text-2xl font-bold text-white">${plan.price_usd} <span className="text-sm font-normal text-gray-400">/ {plan.interval}</span></div>
                            <div className="text-sm text-gray-400">₹{plan.price_inr}</div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                            <Button variant="outline" size="sm" className="text-xs text-red-400 hover:text-red-300">Delete</Button>
                        </div>
                    </div>
                ))}
                {plans.length === 0 && !loading && (
                    <p className="text-gray-400 col-span-full text-center py-8">No plans found.</p>
                )}
            </div>
        </div>
    )
}
