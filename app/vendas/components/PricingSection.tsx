"use client";

import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { MOBILE_PLAN_HOOK, PLANS } from "../lib/pricing";
import { MagneticButton } from "./MagneticButton";

interface PricingSectionProps {
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
}

// Checkout isn't live yet — both plan CTAs are fully styled/interactive
// but intentionally do nothing until real checkout exists.
// TODO: redirecionar para checkout Lastlink quando estiver disponível
function handleCheckoutClick(e: ReactMouseEvent<HTMLElement>) {
  e.preventDefault();
  console.log("checkout pendente");
}

/**
 * Two-tier pricing (Básico / Premium) + comparison table. Copy, prices, and
 * bullet order come from lib/pricing.ts and are locked — this file only
 * decides how they're presented.
 */
export function PricingSection({ onPointerMove }: PricingSectionProps) {
  return (
    <section className="plans" id="planos">
      <div className="head">
        <span className="kicker" style={{ display: "flex", justifyContent: "center" }}>Escolha como começar</span>
        <h2>Um plano para cada tamanho de escritório</h2>
      </div>
      <p className="plans-note">Dois planos, um caminho óbvio: comece pelo essencial ou já entre operando sem limites.</p>

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card reveal spotlight tilt${plan.featured ? " feat" : ""}`}
            // Persuasion trigger: the featured (Premium) card reveals with a
            // slight extra delay so it reads as the section's culmination,
            // not just "another option" arriving at the same time.
            style={plan.featured ? { transitionDelay: "140ms" } : undefined}
            onPointerMove={onPointerMove}
          >
            {/* Trigger: top badge — the strongest single visual cue that this is the "right" choice */}
            {plan.badge && <span className="save-badge">{plan.badge.toUpperCase()}</span>}
            <span className="kicker">{plan.tagline}</span>
            <h3>{plan.name}</h3>

            {/* Trigger: price anchoring — big number, small reframing subtext right under it */}
            <div className="price">
              <span className="cur">R$</span>
              <span className="val">{plan.price}</span>
              <span className="per">{plan.period}</span>
            </div>
            {plan.priceAnchor && <p className="price-note price-anchor">{plan.priceAnchor}</p>}

            <ul>
              {plan.features.map((f) => (
                <li key={f.lead}>
                  <svg className="icon"><use href="#i-check" /></svg>
                  <span>
                    <strong>{f.lead}</strong>
                    {f.rest}
                  </span>
                </li>
              ))}
            </ul>

            {/* Trigger: reinforcement microcopy — reframes Básico as "just the essentials" right before the ask */}
            {plan.reinforcement && <p className="plan-reinforcement">{plan.reinforcement}</p>}

            {plan.ctaVariant === "primary" ? (
              <MagneticButton href="#" className="btn btn-primary spotlight" onPointerMove={onPointerMove} onClick={handleCheckoutClick}>
                {plan.ctaLabel}
              </MagneticButton>
            ) : (
              <a href="#" className="btn btn-ghost spotlight" onPointerMove={onPointerMove} onClick={handleCheckoutClick}>
                {plan.ctaLabel}
              </a>
            )}
            {plan.ctaNote && <p className="plan-cta-note">{plan.ctaNote}</p>}
          </div>
        )).reduce<ReactNode[]>((acc, card, i) => {
          acc.push(card);
          // Mobile-only bridge between Básico and Premium — invisible on
          // desktop (side-by-side grid), see .plan-hook in vendas.css.
          if (i === 0) {
            acc.push(
              <div className="plan-hook" key="plan-hook">
                <span className="kicker">{MOBILE_PLAN_HOOK.kicker}</span>
                <p>{MOBILE_PLAN_HOOK.text}</p>
              </div>
            );
          }
          return acc;
        }, [])}
      </div>
    </section>
  );
}
