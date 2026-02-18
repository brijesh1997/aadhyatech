"use client"

import PlanForm from "@/components/super-admin/PlanForm";
import api from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditPlanPage() {
    const params = useParams();
    const id = params.id as string;
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                // Since we don't have a single plan endpoint in the admin route yet,
                // we might need to filter from all plans or user the public endpoint if it returns everything details.
                // Or better, let's assume valid REST practices and try GET /plans/:id? But wait, standard public get might mask stuff?
                // Actually controller has deletePlan by ID, updatePlan by ID. It doesn't have getPlanById explicitly for admin.
                // But getPublicPlans returns everything.
                // Let's check planController again. It lacks getPlanById.
                // We'll use getPublicPlans response locally filtering?
                // OR add getPlanById to backend.
                // For now, let's assume we can fetch all admin plans and find it.
                const res = await api.get('/plans/admin/all');
                const foundPlan = res.data.find((p: any) => p.id === id);
                setPlan(foundPlan);
            } catch (error) {
                console.error("Error fetching plan", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlan();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900">Plan not found</h2>
                <Link href="/super-admin/plans" className="text-accent-blue hover:underline mt-2 inline-block">
                    Back to Plans
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Link href="/super-admin/plans" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">Edit Plan</h1>
                    <p className="text-gray-500">Update subscription details</p>
                </div>
            </div>

            <PlanForm initialData={plan} isEdit={true} />
        </div>
    );
}
