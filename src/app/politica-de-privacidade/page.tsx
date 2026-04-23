import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

const LAST_UPDATED = "23 de abril de 2026";

export const metadata: Metadata = {
  title: "Política de Privacidade – ContemplaHub",
  description:
    "Política de Privacidade do ContemplaHub com informações sobre coleta, uso, segurança e direitos relacionados a dados pessoais.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPageShell
      title="Política de Privacidade – ContemplaHub"
      description="Este documento resume como o ContemplaHub trata dados pessoais no contexto da operação comercial e operacional realizada por empresas parceiras que utilizam a plataforma."
      lastUpdated={LAST_UPDATED}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">1. Sobre o ContemplaHub</h2>
        <p>
          O ContemplaHub é uma plataforma utilizada por empresas parceiras para
          gestão comercial e operacional de leads, atendimentos, propostas e
          rotinas relacionadas à operação da jornada do cliente.
        </p>
        <p>
          O uso da plataforma ocorre dentro da operação dos clientes que a
          contratam, e os dados pessoais tratados no sistema estão vinculados a
          essa finalidade operacional.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">2. Dados que podem ser coletados</h2>
        <p>Dependendo do contexto de uso, podem ser tratados dados como:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-emerald-300">
          <li>nome</li>
          <li>telefone</li>
          <li>e-mail</li>
          <li>respostas enviadas em formulários</li>
          <li>dados de origem da captação, quando aplicável</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">3. Finalidades de uso</h2>
        <p>Os dados podem ser utilizados para:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-emerald-300">
          <li>contato comercial</li>
          <li>atendimento</li>
          <li>simulação e acompanhamento de propostas</li>
          <li>operação da plataforma</li>
          <li>melhoria da experiência e da segurança</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">4. Titularidade e responsabilidade operacional</h2>
        <p>
          Os dados pessoais tratados no ContemplaHub pertencem à operação das
          empresas clientes que utilizam a plataforma. O ContemplaHub atua como
          suporte tecnológico para essa operação, dentro dos limites necessários
          ao funcionamento do serviço.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">5. Compartilhamento de dados</h2>
        <p>
          O ContemplaHub não vende dados pessoais. Pode haver compartilhamento
          com operadores e prestadores de serviço estritamente necessários para
          hospedagem, processamento, comunicação e segurança da plataforma,
          sempre dentro de finalidade compatível com a operação.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">6. Segurança e armazenamento</h2>
        <p>
          Os dados são armazenados com medidas razoáveis de segurança,
          considerando controles técnicos e operacionais compatíveis com a
          natureza da plataforma e com a finalidade do tratamento.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">7. Direitos do titular</h2>
        <p>O titular poderá solicitar, quando aplicável:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-emerald-300">
          <li>acesso aos dados</li>
          <li>correção</li>
          <li>atualização</li>
          <li>exclusão, quando aplicável</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">8. Contato</h2>
        <p>
          Solicitações relacionadas a privacidade, atualização ou exclusão de
          dados podem ser enviadas para{" "}
          <a
            href="mailto:contato@autentikadigital.com"
            className="font-medium text-emerald-300 underline underline-offset-4"
          >
            contato@autentikadigital.com
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
