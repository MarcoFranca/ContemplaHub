import { Hero } from "@/components/marketing/Hero";
import { Benefits } from "@/components/marketing/Benefits";
import { SimulatorCTA } from "@/components/marketing/SimulatorCTA";
import { WhyAutentika } from "@/components/marketing/WhyAutentika";
import { Testimonials } from "@/components/marketing/Testimonials";
import { GuideCTA } from "@/components/marketing/GuideCTA";
import { DiagnosticForm } from "@/components/marketing/DiagnosticForm";
import { SiteFooter } from "@/components/marketing/SiteFooter";


export default function Page() {
    return (
        <main>
            <Hero />
            <Benefits />
            <SimulatorCTA />
            <WhyAutentika />
            <Testimonials />
            <GuideCTA />
            <DiagnosticForm />
            <SiteFooter />
        </main>
    );
}