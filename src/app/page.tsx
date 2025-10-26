// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Suspense } from "react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Server action helper to fallback to API route (recommended for RLS-safe inserts)
async function submitLead(formData: FormData) {
  "use server";
  const payload = Object.fromEntries(formData.entries());
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Falha ao enviar lead");
// Opcional: redirecionar para página de obrigado
// const { redirect } = await import("next/navigation");
// redirect("/obrigado");
  } catch (e) {
    console.error(e);
  }
}

export const metadata: Metadata = {
  title: "Autentika Seguros – Consórcio inteligente e proteção patrimonial",
  description:
      "Planeje hoje, conquiste sempre. Consórcio imobiliário e de auto com estratégia, CRM e previsões de contemplação.",
};

export default async function HomePage() {
  return (
      <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
        <NavBar />
        <Hero />
        <Separator className="my-8 bg-white/10" />
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 items-start">
          <ValueProps />
          <Suspense>
            <LeadForm />
          </Suspense>
        </div>
        <Separator className="my-16 bg-white/10" />
        <SocialProof />
        <Separator className="my-16 bg-white/10" />
        <FAQ />
        <CtaSection />
        <SiteFooter />
      </main>
  );
}

function BrandMark() {
  return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-400" />
        <span className="font-semibold tracking-tight">Autentika Seguros</span>
      </div>
  );
}

function NavBar() {
  return (
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-b border-white/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <BrandMark />
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-200">
            <Link href="#beneficios" className="hover:text-white">Benefícios</Link>
            <Link href="#depoimentos" className="hover:text-white">Resultados</Link>
            <Link href="#faq" className="hover:text-white">Dúvidas</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-white/20 text-slate-100 hover:bg-white/10">
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999"}?text=Quero%20simular%20meu%20cons%C3%B3rcio`}
                 target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </Button>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-black">
              <a href="#simular">Simular agora</a>
            </Button>
          </div>
        </div>
      </header>
  );
}

function Hero() {
  return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-sky-400/10 to-transparent" />
        <div className="container mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Planeje hoje, <span className="text-emerald-400">conquiste sempre</span>.
            </h1>
            <p className="text-slate-200/90 text-lg">
              Consórcio como estratégia de liberdade financeira: previsível, seguro e sem juros.
              Diagnóstico consultivo, simulações inteligentes e acompanhamento até a contemplação.
            </p>
            <div className="flex flex-wrap gap-3">
              <BadgePill>Imobiliário (foco 80%)</BadgePill>
              <BadgePill>Auto (20%)</BadgePill>
              <BadgePill>WhatsApp integrado</BadgePill>
              <BadgePill>Proposta PDF automática</BadgePill>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-black">
                <a href="#simular">Quero simular</a>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-slate-100 hover:bg-white/10">
                <a href="#beneficios">Ver benefícios</a>
              </Button>
            </div>
            <p className="text-xs text-slate-400">Nunca prometemos “contemplação garantida”. Comunicação ética, clara e rastreável (LGPD + BACEN).</p>
          </div>
          <div className="relative">
            <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-emerald-400/10 to-sky-400/10 border border-white/10 overflow-hidden">
              <Image src="/hero-consorcio.jpg" alt="Estratégia de consórcio" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
  );
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function ValueProps() {
  const items = [
    {
      title: "Diagnóstico consultivo",
      desc: "Entendemos seu objetivo (moradia, renda ou patrimônio) e desenhamos a melhor estratégia.",
    },
    {
      title: "Comparativo Consórcio x Financiamento",
      desc: "Mostramos a economia real ao evitar juros e otimizar prazos e lances.",
    },
    {
      title: "Lance Ótimo (beta)",
      desc: "Estimativa baseada em média histórica + sazonalidade do grupo para aumentar sua previsibilidade.",
    },
    {
      title: "Acompanhamento até a contemplação",
      desc: "Alertas de assembleia, janelas de lance e pós-venda educativo para reduzir cancelamentos.",
    },
  ];
  return (
      <div id="beneficios" className="space-y-4">
        <h2 className="text-2xl font-semibold">Por que a Autentika?</h2>
        <div className="grid gap-4">
          {items.map((it) => (
              <Card key={it.title} className="bg-white/5 border-white/10">
                <CardContent className="p-5">
                  <h3 className="font-medium mb-1">{it.title}</h3>
                  <p className="text-sm text-slate-200/90">{it.desc}</p>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  );
}

function LeadForm() {
  return (
      <section id="simular">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-1">Simule seu consórcio</h2>
            <p className="text-slate-300 text-sm mb-4">Sem compromisso. Resposta no WhatsApp em até 5 minutos.</p>

            <form action={submitLead} className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" required placeholder="Seu nome" />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
                  <Input id="telefone" name="telefone" required placeholder="(11) 9 9999-9999" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" name="email" placeholder="voce@email.com" />
                </div>
                <div>
                  <Label>Perfil</Label>
                  <Select name="perfil" defaultValue="nao_informado">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disciplinado_acumulador">Disciplinado Acumulador</SelectItem>
                      <SelectItem value="sonhador_familiar">Sonhador Familiar</SelectItem>
                      <SelectItem value="corporativo_racional">Corporativo Racional</SelectItem>
                      <SelectItem value="impulsivo_emocional">Impulsivo Emocional</SelectItem>
                      <SelectItem value="estrategico_oportunista">Estratégico Oportunista</SelectItem>
                      <SelectItem value="nao_informado">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor da carta (R$)</Label>
                  <Input id="valor" name="valor_carta" inputMode="numeric" placeholder="300.000" />
                </div>
                <div>
                  <Label htmlFor="prazo">Prazo (meses)</Label>
                  <Input id="prazo" name="prazo_meses" inputMode="numeric" placeholder="180" />
                </div>
              </div>

              <div>
                <Label htmlFor="objetivo">Objetivo</Label>
                <Textarea id="objetivo" name="objetivo" placeholder="Conte em 1 frase seu objetivo (ex.: primeira casa, renda com aluguel, upgrade do carro)..." />
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-300">
                <input type="checkbox" name="consentimento" value="true" required className="mt-1" />
                <span>
                Concordo em receber contato da Autentika (LGPD).
                <Link href="/politica-de-privacidade" className="underline">Política de Privacidade</Link>.
              </span>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black">Enviar</Button>
                <Button type="button" asChild variant="outline" className="border-white/20 text-slate-100 hover:bg-white/10">
                  <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999"}?text=Quero%20simular%20meu%20cons%C3%B3rcio`}
                     target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
  );
}

function SocialProof() {
  return (
      <section id="depoimentos" className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Resultados e confiança</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {["+25% de fechamento","SLA &lt; 5 min","NPS 70+"].map((t) => (
              <Card key={t} className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{t}</p>
                  <p className="text-sm text-slate-300 mt-2">Métricas-alvo acompanhadas no painel.</p>
                </CardContent>
              </Card>
          ))}
        </div>
      </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Consórcio tem juros?",
      a: "Não. Há taxa de administração e, em alguns casos, correção por indexador (Ex.: INCC).",
    },
    {
      q: "O que é contemplação?",
      a: "É quando você é sorteado ou seu lance é aceito, liberando a carta de crédito para uso conforme regras do grupo.",
    },
    {
      q: "Vocês garantem contemplação?",
      a: "Nunca prometemos contemplação garantida. Trabalhamos com estratégia de lances e previsões para aumentar sua previsibilidade.",
    },
  ];
  return (
      <section id="faq" className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">Dúvidas frequentes</h2>
        <div className="grid gap-4">
          {items.map((it) => (
              <Card key={it.q} className="bg-white/5 border-white/10">
                <CardContent className="p-5">
                  <p className="font-medium">{it.q}</p>
                  <p className="text-sm text-slate-300 mt-1">{it.a}</p>
                </CardContent>
              </Card>
          ))}
        </div>
      </section>
  );
}

function CtaSection() {
  return (
      <section className="container mx-auto px-4 my-16">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 p-8 text-center">
          <h3 className="text-2xl font-semibold mb-2">Pronto para começar?</h3>
          <p className="text-slate-300 mb-4">Receba um diagnóstico consultivo e a simulação mais adequada ao seu objetivo.</p>
          <div className="flex justify-center gap-3">
            <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-black"><a href="#simular">Simular agora</a></Button>
            <Button asChild variant="outline" className="border-white/20 text-slate-100 hover:bg-white/10">
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999"}`}
                 target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            </Button>
          </div>
        </div>
      </section>
  );
}

function SiteFooter() {
  return (
      <footer className="border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <BrandMark />
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Autentika Seguros. Todos os direitos reservados.</p>
          <div className="text-xs text-slate-400 flex gap-4">
            <Link href="/termos">Termos de Uso</Link>
            <Link href="/politica-de-privacidade">Privacidade</Link>
          </div>
        </div>
      </footer>
  );
}

