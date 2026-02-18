import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const services = [
    { title: "Website Development", description: "Responsive, high-performance websites tailored to your brand." },
    { title: "App Development", description: "Native and cross-platform mobile applications for iOS and Android." },
    { title: "Game Development", description: "Immersive gaming experiences built with Unity and Unreal Engine." },
    { title: "UI/UX Design", description: "User-centric design that delights and converts." },
];

export default function Services() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <div className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white">Our Services</h1>
                    <p className="mt-4 text-xl text-gray-400">Comprehensive IT solutions for every need.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service) => (
                        <div key={service.title} className="p-6 bg-slate-800 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                            <p className="text-gray-400">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
