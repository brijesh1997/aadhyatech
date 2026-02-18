import Navbar from "@/components/layout/Navbar";
import PricingComponent from "@/components/home/Pricing";
import Footer from "@/components/layout/Footer";

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <div className="flex-grow pt-20">
                <PricingComponent />
            </div>
            <Footer />
        </main>
    );
}
