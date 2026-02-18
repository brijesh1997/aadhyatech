import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function About() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <div className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white">About Aadhyatech</h1>
                    <p className="mt-4 text-xl text-gray-400">Driving innovation through technology.</p>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-gray-300">
                        Aadhyatech is a premium IT services provider delivering top-tier website development, mobile app creation, and game design solutions.
                        We believe in the power of technology to transform businesses and create engaging user experiences.
                    </p>
                    <p className="text-lg text-gray-300 mt-4">
                        Our team of dedicated experts works tirelessly to bring your vision to life, ensuring scalability, security, and a stunning aesthetic.
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
