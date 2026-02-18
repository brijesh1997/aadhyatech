"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-dark-900 text-white border-t border-dark-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/">
                            <span className="text-2xl font-display font-extrabold tracking-tighter text-white">
                                AADHYA<span className="text-accent-blue">TECH</span>.
                            </span>
                        </Link>
                        <p className="text-gray-400 font-body leading-relaxed">
                            Premium Digital Solutions for forward-thinking businesses. We build the future.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="text-gray-400 hover:text-white hover:bg-accent-blue p-2 rounded-full transition-all duration-300">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-display font-bold">Menu</h3>
                        <ul className="space-y-4">
                            {['Home', 'About', 'Services', 'Pricing', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-accent-blue" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-display font-bold">Services</h3>
                        <ul className="space-y-4">
                            {['Web Development', 'Mobile Apps', 'Game Design', 'UI/UX Design', 'Cloud Solutions'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-display font-bold">Newsletter</h3>
                        <p className="text-gray-400 font-body">Subscribe for latest updates.</p>
                        <form className="flex flex-col space-y-3">
                            <input
                                type="email"
                                placeholder="Enter email address"
                                className="bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                            />
                            <button type="submit" className="bg-accent-blue text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>

                </div>

                <div className="border-t border-dark-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Aadhyatech. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
