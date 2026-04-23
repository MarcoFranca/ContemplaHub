import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

const LAST_UPDATED = "23 de abril de 2026";

export const metadata: Metadata = {
  title: "Solicitação de Exclusão de Dados – ContemplaHub",
  description:
    "Orientações públicas para solicitar exclusão ou correção de dados pessoais relacionados ao uso do ContemplaHub.",
};

export default function ExclusaoDeDadosPage() {
  return (
    <LegalPageShell
      title="Solicitação de Exclusão de Dados – ContemplaHub"
      description="Esta página reúne as instruções públicas para solicitações de exclusão ou correção de dados pessoais relacionados ao uso da plataforma ContemplaHub."
      lastUpdated={LAST_UPDATED}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">1. Como solicitar</h2>
        <p>
          O titular dos dados pode solicitar exclusão e/ou correção de dados
          pessoais vinculados ao uso do ContemplaHub.
        </p>
        <p>
          A solicitação deve ser enviada para{" "}
          <a
            href="mailto:contato@autentikadigital.com"
            className="font-medium text-emerald-300 underline underline-offset-4"
          >
            contato@autentikadigital.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">2. Informações mínimas necessárias</h2>
        <p>Para facilitar a análise, a mensagem deve conter, no mínimo:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-emerald-300">
          <li>nome completo</li>
          <li>e-mail e/ou telefone utilizado no cadastro</li>
          <li>descrição da solicitação</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">3. Análise da solicitação</h2>
        <p>
          Cada pedido será analisado de acordo com o contexto operacional, com
          as obrigações legais e regulatórias aplicáveis e com a necessidade de
          retenção mínima de registros quando exigida.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">4. Prazo de resposta</h2>
        <p>
          O ContemplaHub dará retorno em prazo razoável, conforme a natureza da
          solicitação e a complexidade da análise necessária.
        </p>
      </section>
    </LegalPageShell>
  );
}
