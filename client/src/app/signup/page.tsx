"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import GoogleButton from "@/components/auth/GoogleButton"

export default function Signup() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Save selected plan from URL to localStorage
    if (typeof window !== 'undefined') {
        const plan = searchParams.get('plan')
        if (plan) {
            localStorage.setItem('selected_plan', plan)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            const res = await api.post("/auth/register", {
                email: formData.email,
                password: formData.password
            })
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.response?.data?.error || "Signup failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-12 shadow-2xl border border-gray-200 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-purple/5 rounded-full blur-2xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

                <div className="flex flex-col items-center text-center">
                    <h1 className="text-3xl font-display font-bold text-dark-900 mb-2">Sign Up</h1>
                    <p className="text-gray-400 text-sm mb-8 font-body">Create your account to get started.</p>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm py-2 px-4 rounded mb-6 w-full">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-gray-50 border border-gray-200 text-dark-900 rounded px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-gray-50 border border-gray-200 text-dark-900 rounded px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full bg-gray-50 border border-gray-200 text-dark-900 rounded px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-dark-900 text-white font-bold text-xs uppercase tracking-widest py-4 rounded hover:bg-accent-blue transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="relative w-full my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <GoogleButton text="Sign up with Google" />

                    <div className="mt-6 text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="text-dark-900 font-bold hover:text-accent-blue transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
