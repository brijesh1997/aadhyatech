"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentCancel() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full bg-slate-800 p-8 rounded-lg shadow-xl text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                    <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-4">Payment Canceled</h2>
                <p className="text-gray-300 mb-8">
                    Your payment was canceled or failed. No charges were made.
                </p>
                <Link href="/pricing">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-slate-700">
                        Try Again
                    </Button>
                </Link>
            </div>
        </div>
    )
}
