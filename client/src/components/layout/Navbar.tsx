"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-[60px]"> {/* Added padding-left for vertical line spacing */}
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0">
                            <span className={`text-2xl font-display font-extrabold tracking-tighter ${scrolled ? "text-dark-900" : "text-dark-900"}`}>
                                AADHYA<span className="text-accent-blue">TECH</span>.
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-10">
                            {['Home', 'About', 'Services', 'Pricing', 'Contact'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                    className="font-display font-bold text-xs uppercase tracking-widest text-dark-900 hover:text-accent-blue transition-colors duration-300 relative group"
                                >
                                    {item}
                                    {/* Removed underline, relying on color change as per Deon style */}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <Link href="/login">
                            <button className="bg-dark-900 text-white px-8 py-3 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-accent-blue transition-colors">
                                GET STARTED
                            </button>
                        </Link>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-dark-900 hover:text-accent-blue focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {['Home', 'About', 'Services', 'Pricing', 'Contact'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                className="block px-3 py-2 rounded-md text-base font-bold text-dark-900 hover:bg-gray-50 hover:text-accent-blue uppercase tracking-wider"
                                onClick={() => setIsOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full mt-4">
                            <button className="w-full bg-dark-900 text-white px-6 py-3 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-accent-blue transition-colors">
                                GET STARTED
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
