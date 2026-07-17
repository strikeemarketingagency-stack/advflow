"use client";

import { COMPARISON_ROWS } from "../lib/pricing";

/**
 * Comparison table — split out of PricingSection so it can render in a
 * different slide (moved to sit alongside the guarantee card, per request).
 * Premium column visually singled out (gold border/tint) and "Documentos
 * exportados" spells out the Básico cost explicitly (loss aversion beats a
 * blank/neutral cell).
 */
export function PricingComparisonTable() {
  return (
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
                <td data-label="Básico">{row.basico}</td>
                <td className="col-premium" data-label="Premium">{row.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
