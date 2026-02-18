"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export default function WhoWeAre() {
    return (
        <section className="section-padding bg-white relative overflow-hidden">
            <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Text Content */}
                <div className="order-2 lg:order-1">
                    <span className="text-accent-blue text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                        Who We Are
                    </span>
                    <h2 className="text-5xl md:text-6xl font-display font-bold text-dark-900 mb-8 leading-tight">
                        Network <br /> Structure Design
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed mb-6 font-body">
                        We specialize in building robust digital infrastructures that scale with your business.
                        From server management to front-end excellence, we cover every aspect of modern technology.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                        <div className="border-l-2 border-accent-blue pl-6">
                            <h4 className="font-display font-bold text-xl mb-2">Secure & Safe</h4>
                            <p className="text-sm text-gray-400">Enterprise grade security for all your applications.</p>
                        </div>
                        <div className="border-l-2 border-accent-purple pl-6">
                            <h4 className="font-display font-bold text-xl mb-2">Fast Performance</h4>
                            <p className="text-sm text-gray-400">Optimized for speed and high availability.</p>
                        </div>
                    </div>

                    <Link href="/about" className="group inline-flex items-center text-dark-900 font-bold uppercase tracking-widest text-xs hover:text-accent-blue transition-colors">
                        Read More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Visual/Image (3D Mobile Mockup) */}
                <div className="relative order-1 lg:order-2">
                    <div className="relative w-full aspect-[4/5] flex items-center justify-center">
                        <Image
                            src="/images/who-we-are-mockup.png"
                            alt="Mobile App Login Interface"
                            width={600}
                            height={750}
                            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    {/* Decorative */}
                    <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent-blue/10 rounded-full blur-3xl -z-10"></div>
                </div>

            </div>
        </section>
    )
}
