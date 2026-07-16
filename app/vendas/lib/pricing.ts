// Plan data for the pricing section, kept separate from presentation
// (PricingSection.tsx) so copy/price edits never require touching JSX.
// Content, values, and bullet order are locked per the approved copy —
// do not reorder or reword without checking with whoever owns pricing copy.

export interface PlanFeature {
  /** Bold lead-in ("the result"), rendered at heavier weight for F-pattern scanning. */
  lead: string;
  /** Rest of the sentence, normal weight. */
  rest?: string;
}

export interface Plan {
  id: "basico" | "premium";
  name: string;
  tagline: string;
  price: string;
  period: string;
  /** Premium-only: anchoring subtext under the price ("less than R$2/day…"). */
  priceAnchor?: string;
  /** Premium-only: top badge — the strongest visual persuasion trigger on the card. */
  badge?: string;
  features: PlanFeature[];
  /** Reinforcement microcopy under the bullets (Premium only). */
  reinforcement?: string;
  ctaLabel: string;
  ctaVariant: "ghost" | "primary";
  /** Microcopy under the CTA (Premium only). */
  ctaNote?: string;
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    tagline: "Para começar a organizar",
    price: "29,90",
    period: "/mês",
    features: [
      { lead: "Até 30 clientes ativos/mês" },
      { lead: "Biblioteca de modelos:", rest: " até 10 modelos salvos" },
      { lead: "Suporte padrão", rest: " (e-mail)" },
    ],
    ctaLabel: "Assinar Plano Básico",
    ctaVariant: "ghost",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Para quem já decidiu crescer",
    price: "59,90",
    period: "/mês",
    // Price anchoring: reframes the monthly total as a trivial daily cost.
    priceAnchor: "menos de R$ 2 por dia para nunca mais perder um cliente por limite de sistema",
    // Badge: the single strongest visual trigger on the card — pinned to
    // the top, breaks pattern from the Básico card entirely.
    badge: "O escolhido por quem quer crescer",
    features: [
      {
        lead: "Clientes ilimitados —",
        rest: " cresça sem esbarrar em teto. Enquanto seus concorrentes recusam clientes por falta de sistema, você simplesmente cadastra mais um.",
      },
      {
        lead: "Biblioteca de modelos ilimitada, atualizada toda semana —",
        rest: " nunca fique para trás. Novos modelos jurídicos chegam prontos, sem você precisar redigir do zero.",
      },
      {
        lead: "Documentos com a sua marca, não com a nossa —",
        rest: " logo e papel timbrado automáticos em cada PDF exportado. Seu cliente vê profissionalismo. Ele nunca vê o AdvFlow.",
      },
      {
        lead: "Painel de produtividade —",
        rest: " veja em números quanto tempo você já economizou. Prova visual, mês a mês, de que seu escritório está mais eficiente.",
      },
      {
        lead: "Suporte prioritário —",
        rest: " quando você precisar, você não espera fila. Resposta rápida, sempre.",
      },
    ],
    // Reinforcement copy: reframes Básico as merely "the essential" right
    // before the CTA, priming the visitor toward Premium as the real choice.
    reinforcement:
      "O Básico resolve o essencial. O Premium é para quem já decidiu que seu escritório vai operar no nível seguinte.",
    ctaLabel: "Quero Operar no Nível Premium",
    ctaVariant: "primary",
    ctaNote: "Cancele quando quiser. Sem contrato de fidelidade.",
    featured: true,
  },
];

export interface ComparisonRow {
  category: string;
  /** Icon id from the page's inline <svg><defs> sprite (e.g. "i-users"). */
  icon: string;
  basico: string;
  premium: string;
}

// "Documentos exportados" deliberately spells out "com marca AdvFlow" for
// Básico instead of leaving it blank/"—": a visible loss reads as a much
// stronger trigger than a neutral absence (loss aversion > feature list).
export const COMPARISON_ROWS: ComparisonRow[] = [
  { category: "Clientes ativos", icon: "i-users", basico: "até 30/mês", premium: "ilimitado" },
  { category: "Modelos na biblioteca", icon: "i-library", basico: "até 10", premium: "ilimitado + novos toda semana" },
  { category: "Documentos exportados", icon: "i-file", basico: "com marca AdvFlow", premium: "com a sua marca" },
  { category: "Suporte", icon: "i-zap", basico: "padrão", premium: "prioritário" },
  { category: "Visibilidade do crescimento", icon: "i-trend", basico: "—", premium: "painel de produtividade" },
];
