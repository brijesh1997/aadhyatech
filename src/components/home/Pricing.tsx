"use client"

import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api" // Assuming api helper exists, or use fetch

export default function Pricing() {
    const router = useRouter();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currencySymbol, setCurrencySymbol] = useState("₹");

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            // Using the public endpoint we saw in planController
            const res = await api.get('/plans');
            setPlans(res.data.plans || []);
            setCurrencySymbol(res.data.symbol || "₹");
        } catch (error) {
            console.error("Failed to fetch plans:", error);
            // Fallback or empty state could be handled here
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = (planName: string) => {
        // Using plan name as param since signup likely expects it
        router.push(`/signup?plan=${planName}`);
    }

    if (loading) {
        return (
            <section id="pricing" className="section-padding bg-light-50 min-h-[600px] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
            </section>
        )
    }

    return (
        <section id="pricing" className="section-padding bg-light-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-0 w-full h-[500px] bg-white -skew-y-3 z-0 transform origin-left"></div>

            <div className="container-custom relative z-10">
                <div className="text-center mb-16">
                    <span className="text-accent-blue text-sm font-bold uppercase tracking-widest mb-2 block">Our Pricing</span>
                    <h2 className="text-4xl md:text-5xl font-display font-extrabold text-dark-900">
                        Choose Your Plan
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan: any, index: number) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-center text-center border ${plan.is_popular ? 'border-accent-purple/30 ring-2 ring-accent-purple/10' : 'border-transparent'}`}
                        >
                            {plan.is_popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-accent-purple text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-display font-bold text-dark-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center text-dark-900">
                                    <span className="text-3xl font-extrabold tracking-tight">
                                        {plan.symbol || currencySymbol}{plan.price}
                                    </span>
                                    <span className="ml-1 text-sm font-semibold text-gray-400">
                                        /{plan.interval === 'YEARLY' ? 'year' : 'month'}
                                    </span>
                                </div>
                            </div>

                            <ul className="mb-8 space-y-3 w-full text-left flex-grow">
                                {Array.isArray(plan.features) && plan.features.map((feature: any, i: number) => (
                                    <li key={i} className="flex items-center text-sm text-gray-500">
                                        <div className={`p-1 rounded-full mr-3 flex-shrink-0 ${plan.is_popular ? 'bg-accent-purple/10 text-accent-purple' : 'bg-gray-100 text-gray-400'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span>{typeof feature === 'string' ? feature : JSON.stringify(feature)}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full rounded-full font-bold py-6 ${plan.is_popular ? "bg-primary-gradient text-white shadow-lg hover:shadow-glow" : "bg-dark-900 text-white hover:bg-dark-800"}`}
                                onClick={() => handleSubscribe(plan.name)}
                            >
                                Select Plan
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
