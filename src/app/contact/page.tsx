import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function Contact() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <div className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white">Contact Us</h1>
                    <p className="mt-4 text-xl text-gray-400">We'd love to hear from you.</p>
                </div>

                <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-lg shadow-lg">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                            <input type="text" id="name" className="mt-1 block w-full rounded-md bg-slate-900 border-slate-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                            <input type="email" id="email" className="mt-1 block w-full rounded-md bg-slate-900 border-slate-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                            <textarea id="message" rows={4} className="mt-1 block w-full rounded-md bg-slate-900 border-slate-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"></textarea>
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90">Send Message</Button>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}
