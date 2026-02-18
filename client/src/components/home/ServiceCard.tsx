"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface ServiceCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    href?: string;
}

export default function ServiceCard({ title, description, href = "/services" }: ServiceCardProps) {
    return (
        <div className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>

            <h3 className="text-2xl font-display font-bold text-dark-900 mb-4 relative z-10">{title}</h3>
            <p className="text-gray-500 mb-8 relative z-10 leading-relaxed font-body">{description}</p>

            <Link href={href} className="inline-flex items-center text-sm font-bold text-dark-900 uppercase tracking-widest hover:text-accent-blue transition-colors">
                Read More <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
        </div>
    )
}
