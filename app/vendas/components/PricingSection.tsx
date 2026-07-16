"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { COMPARISON_ROWS, PLANS } from "../lib/pricing";
import { MagneticButton } from "./MagneticButton";
import Link from "next/link";

interface PricingSectionProps {
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
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
              <MagneticButton href="/login" className="btn btn-primary spotlight" onPointerMove={onPointerMove}>
                {plan.ctaLabel}
              </MagneticButton>
            ) : (
              <Link href="/login" className="btn btn-ghost spotlight" onPointerMove={onPointerMove}>
                {plan.ctaLabel}
              </Link>
            )}
            {plan.ctaNote && <p className="plan-cta-note">{plan.ctaNote}</p>}
          </div>
        ))}
      </div>

      {/* Comparison table — Premium column visually singled out (gold
          border/tint) and "Documentos exportados" spells out the Básico
          cost explicitly (loss aversion beats a blank/neutral cell). */}
      <div className="compare-table-outer">
        <div className="compare-table-glow" aria-hidden="true" />
        <div className="compare-table-wrap">
        <table className="compare-table">
          <colgroup>
            <col className="col-category" />
            <col className="col-basico" />
            <col className="col-premium-col" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Categoria</th>
              <th scope="col">Básico</th>
              <th scope="col" className="col-premium">
                <span className="col-premium-tag">Recomendado</span>
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.category}>
                <th scope="row">
                  <span className="compare-icn"><svg className="icon"><use href={`#${row.icon}`} /></svg></span>
                  {row.category}
                </th>
                <td>{row.basico}</td>
                <td className="col-premium">{row.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  );
}
