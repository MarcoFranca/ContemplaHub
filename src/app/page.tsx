import { Hero } from "@/components/marketing/Hero";
import { Benefits } from "@/components/marketing/Benefits";
import { SimulatorCTA } from "@/components/marketing/SimulatorCTA";
import { WhyAutentika } from "@/components/marketing/WhyAutentika";
import { Testimonials } from "@/components/marketing/Testimonials";
import { GuideCTA } from "@/components/marketing/GuideCTA";
import { DiagnosticForm } from "@/components/marketing/DiagnosticForm";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SectionDivider } from "@/components/marketing/SectionDivider";
import {FounderSection} from "@/components/marketing/FounderSection";

export default function Page() {
    return (
        <main className="overflow-hidden relative min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
            <Hero />
            {/*<SectionDivider />*/}
            <Benefits />
            {/*<SectionDivider emerald={false} />*/}
            <SimulatorCTA />
            {/*<SectionDivider subtle />*/}
            <WhyAutentika />
            <SectionDivider emerald={false} />
            <FounderSection
                waPhone={process.env.NEXT_PUBLIC_WA_PHONE ?? "5521969639576"}
                years={10}
                cnpj="25.241.008/0001-70"
                susep="30QP3J"
                linkedinUrl="https://www.linkedin.com/in/wagnerlisboa" // ajuste se tiver
            />
            <SectionDivider />
            <Testimonials />
            <SectionDivider emerald={false} />
            <GuideCTA />
            <SectionDivider subtle flip />
            <DiagnosticForm />
            <SectionDivider />
            <SiteFooter />
        </main>
    );
}
