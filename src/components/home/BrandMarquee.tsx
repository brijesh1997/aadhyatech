"use client"

import { motion } from "framer-motion"

const brands = [
    "Next Door", "Mantle", "Surface", "Tech Space", "Oculus", "Paradigm", "Gravity"
]

export default function BrandMarquee() {
    return (
        <section className="py-16 bg-light-50 border-b border-light-100 overflow-hidden">
            <div className="flex w-full">
                <motion.div
                    className="flex space-x-24 whitespace-nowrap"
                    animate={{ x: ["0%", "-100%"] }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                >
                    {[...brands, ...brands, ...brands].map((brand, index) => (
                        <div key={index} className="text-2xl font-display font-bold text-gray-300 uppercase tracking-widest hover:text-dark-900 transition-colors cursor-default">
                            {brand}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
