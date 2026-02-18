"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

const slides = [
    {
        id: 1,
        title1: "Software &",
        title2: "Technology",
        subtitle: "We build high-performance websites, mobile apps, and immersive games. Transform your business with Aadhyatech's premium service.",
    },
    {
        id: 2,
        title1: "Digital",
        title2: "Innovation",
        subtitle: "Creating the future of digital interaction with cutting-edge design and robust engineering.",
    },
    {
        id: 3,
        title1: "Creative",
        title2: "Solutions",
        subtitle: "Empowering brands with unique digital experiences that captivate and convert.",
    }
]

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-20">
            {/* Background Gradients (Subtle, Deon style) */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -z-10 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-50 rounded-full blur-3xl -z-10"></div>

            <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="text-left relative h-[500px] flex flex-col justify-center">

                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block mb-6 text-sm font-bold uppercase tracking-[0.2em] text-accent-blue"
                    >
                        New Generation of Tech
                    </motion.span>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-6xl md:text-8xl lg:text-[100px] font-display font-bold text-dark-900 leading-[0.9] tracking-tighter mb-10">
                                {slides[currentSlide].title1} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark-900 to-dark-700">
                                    {slides[currentSlide].title2}
                                </span>
                            </h1>

                            <p className="max-w-xl text-lg text-gray-500 font-body leading-relaxed mb-12">
                                {slides[currentSlide].subtitle}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex flex-wrap gap-6">
                        <Link href="/contact" className="inline-flex items-center justify-center px-12 py-5 bg-deon-gradient text-white font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 rounded-none border-0">
                            Apply Now
                        </Link>
                        <Link href="/services" className="inline-flex items-center justify-center px-12 py-5 bg-white border border-gray-200 text-dark-900 font-bold text-xs uppercase tracking-widest hover:bg-dark-900 hover:text-white transition-all duration-300 rounded-none relative overflow-hidden group">
                            <span className="relative z-10">View More</span>
                        </Link>
                    </div>
                </div>

                {/* Right Side Visual (3D Abstract Image) */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="relative hidden lg:block flex items-center justify-center"
                >
                    <div className="relative z-10 w-full max-w-[600px]">
                        <Image
                            src="/images/hero-abstract.png"
                            alt="Future Tech Abstract"
                            width={800}
                            height={800}
                            className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                            priority
                        />
                    </div>
                    {/* Floating Decorative Elements */}
                    <div className="absolute top-10 right-10 w-32 h-32 bg-accent-purple/20 rounded-full blur-3xl animate-pulse"></div>
                </motion.div>
            </div>
        </section>
    )
}
