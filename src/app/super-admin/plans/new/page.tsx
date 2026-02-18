"use client"

import PlanForm from "@/components/super-admin/PlanForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPlanPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Link href="/super-admin/plans" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">Create New Plan</h1>
                    <p className="text-gray-500">Add a new subscription tier</p>
                </div>
            </div>

            <PlanForm />
        </div>
    );
}
