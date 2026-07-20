import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

const LAST_UPDATED = "20 de julho de 2026";

export const metadata: Metadata = {
  title: "Politica de Privacidade - ContemplaHub",
  description:
    "Politica de Privacidade do ContemplaHub com informacoes sobre coleta, uso, compartilhamento, seguranca, retencao e exclusao de dados.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPageShell
      title="Politica de Privacidade - ContemplaHub"
      description="Esta politica descreve como o ContemplaHub trata dados pessoais no site, no app e nos fluxos operacionais da plataforma."
      lastUpdated={LAST_UPDATED}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">1. Sobre o ContemplaHub</h2>
        <p>
          O ContemplaHub e uma plataforma de gestao comercial, operacional e de
          relacionamento utilizada por empresas que atuam com vendas,
          atendimento, carteira, comissoes, parceiros e comunicacao com leads e
          clientes.
        </p>
        <p>
          Esta politica se aplica ao uso do site institucional, da aplicacao
          web, do app mobile e de integracoes habilitadas na operacao, como
          canais de mensageria, formularios, campanhas, autenticacao de terceiros
          e agenda, quando aplicavel.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">2. Dados que podem ser coletados</h2>
        <p>Dependendo do modulo utilizado, podemos tratar categorias como:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-emerald-300">
          <li>dados de identificacao, como nome, telefone, e-mail e empresa</li>
          <li>dados comerciais e operacionais, como interesse, produto, cota, carta, contrato e parceiro vinculado</li>
          <li>dados enviados em formularios, landing pages, campanhas e atendimentos</li>
          <li>historico de interacoes em canais como WhatsApp, quando esse canal estiver habilitado pela operacao</li>
          <li>dados de autenticacao e acesso, como e-mail de login, identificadores de conta e registros de sessao</li>
          <li>dados de agenda e agendamento, quando houver integracao com servicos de calendario</li>
          <li>dados de origem de captacao, como campanha, anuncio, formulario, Meta, Facebook ou Instagram, quando aplicavel</li>
          <li>dados tecnicos e de seguranca, como logs operacionais, dispositivo, navegador, IP aproximado e eventos de erro</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">3. Como os dados sao utilizados</h2>
        <p>Os dados podem ser utilizados para:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-emerald-300">
          <li>cadastro, autenticacao e controle de acesso</li>
          <li>atendimento comercial e acompanhamento da jornada do lead e do cliente</li>
          <li>simulacoes, propostas, contratos, carteira, comissoes e repasses</li>
          <li>registro e acompanhamento de pagamentos, competencias e eventos operacionais</li>
          <li>envio e recebimento de mensagens, inclusive por agentes assistidos por IA quando habilitados</li>
          <li>agendamento de reunioes, contatos e tarefas operacionais</li>
          <li>integracao com campanhas de marketing e mensuracao de origem de captacao</li>
          <li>seguranca, auditoria, prevencao a fraude, suporte e melhoria do servico</li>
          <li>cumprimento de obrigacoes legais, regulatorias e contratuais</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">4. Bases operacionais e responsabilidade</h2>
        <p>
          Os dados tratados no ContemplaHub estao vinculados a operacao das
          empresas que contratam ou utilizam a plataforma. Nessas situacoes, o
          ContemplaHub atua como suporte tecnologico, processamento,
          infraestrutura e orquestracao dos fluxos necessarios ao funcionamento
          do servico.
        </p>
        <p>
          Cada organizacao cliente e responsavel pelos dados que insere, importa
          ou opera em sua propria conta, devendo utiliza-los de forma compativel
          com a legislacao aplicavel.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">5. Compartilhamento de dados</h2>
        <p>O ContemplaHub nao vende dados pessoais.</p>
        <p>
          Pode haver compartilhamento com operadores e provedores
          estritamente necessarios para a prestacao do servico, como
          infraestrutura, banco de dados, autenticacao, armazenamento,
          comunicacao, hospedagem, monitoramento, seguranca, analytics e
          integracoes habilitadas pela organizacao usuaria.
        </p>
        <p>Isso pode incluir, quando aplicavel:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-emerald-300">
          <li>provedores de autenticacao, inclusive login social como Google</li>
          <li>canais de comunicacao e atendimento, como WhatsApp</li>
          <li>plataformas de anuncios, formularios e captacao, como Meta, Facebook e Instagram</li>
          <li>servicos de agenda e calendario, quando integrados pelo usuario ou pela organizacao</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">6. Seguranca e armazenamento</h2>
        <p>
          Adotamos medidas tecnicas e organizacionais razoaveis para proteger os
          dados pessoais contra acesso nao autorizado, perda acidental,
          alteracao, divulgacao indevida ou uso abusivo.
        </p>
        <p>Essas medidas podem incluir controle de acesso, isolamento por organizacao, logs, revisao operacional, autenticacao e recursos de infraestrutura gerenciada.</p>
        <p>
          Nenhum ambiente conectado a internet e absolutamente invulneravel, mas
          buscamos manter salvaguardas compativeis com a natureza da plataforma e
          com o contexto de uso.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">7. Retencao e exclusao</h2>
        <p>
          Os dados sao mantidos pelo tempo necessario para cumprir as finalidades
          operacionais da plataforma, atender obrigacoes legais, preservar
          historico contratual, financeiro, de seguranca e de auditoria, ou
          enquanto houver base legitima para o tratamento.
        </p>
        <p>
          Quando a exclusao for solicitada ou quando o tratamento deixar de ser
          necessario, os dados poderao ser eliminados, anonimizados ou
          bloqueados, observadas as obrigacoes de retencao minima e a necessidade
          de preservacao de registros operacionais e legais.
        </p>
        <p>
          As instrucoes publicas para solicitacao de exclusao ou correcao estao
          disponiveis em{" "}
          <Link
            href="/exclusao-de-dados"
            className="font-medium text-emerald-300 underline underline-offset-4"
          >
            /exclusao-de-dados
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">8. Direitos do titular</h2>
        <p>Quando aplicavel, o titular pode solicitar:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-emerald-300">
          <li>confirmacao da existencia de tratamento</li>
          <li>acesso aos dados</li>
          <li>correcao e atualizacao</li>
          <li>anonimizacao, bloqueio ou exclusao, quando cabivel</li>
          <li>informacoes sobre compartilhamento</li>
          <li>revogacao de consentimento, quando essa for a base aplicavel</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">9. Conta, login e acesso restrito</h2>
        <p>
          O ContemplaHub possui areas restritas acessadas por usuarios
          autorizados da organizacao contratante. Em determinados fluxos, o uso
          do app ou da plataforma depende de autenticacao por e-mail e senha ou
          por provedores de login compativeis, quando habilitados.
        </p>
        <p>
          Dados de autenticacao sao utilizados para controle de acesso,
          seguranca, segregacao multiempresa e rastreabilidade operacional.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">10. Contato</h2>
        <p>
          Solicitaoes relacionadas a privacidade, atualizacao, exclusao ou
          seguranca de dados podem ser enviadas para{" "}
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
