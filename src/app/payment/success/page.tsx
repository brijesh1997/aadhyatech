"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full bg-slate-800 p-8 rounded-lg shadow-xl text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-4">Payment Successful!</h2>
                <p className="text-gray-300 mb-8">
                    Thank you for your subscription. Your account has been upgraded.
                </p>
                <Link href="/dashboard">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    )
}
