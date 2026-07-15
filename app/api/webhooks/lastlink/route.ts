import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Webhook da Lastlink — dispara quando uma compra/assinatura é confirmada.
// Documentação: https://support.lastlink.com/pt-BR/articles/12587805
//
// A Lastlink não assina/autentica o webhook nativamente, então o segredo
// mora na própria URL cadastrada no painel dela:
//   https://SEU-DOMINIO/api/webhooks/lastlink?secret=SEU_SEGREDO
//
// Configurar em: Produtos → (produto) → Integrações → Lastlink Webhook.

const CONFIRMED_EVENT = "Purchase_Order_Confirmed";

interface LastlinkBuyer {
  Email?: string;
  Name?: string;
}

interface LastlinkProduct {
  Id?: string;
  Name?: string;
}

interface LastlinkWebhookPayload {
  Event?: string;
  IsTest?: boolean;
  Data?: {
    Buyer?: LastlinkBuyer;
    Products?: LastlinkProduct[];
  };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.LASTLINK_WEBHOOK_SECRET;
  const providedSecret = request.nextUrl.searchParams.get("secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return jsonError("unauthorized", 401);
  }

  let payload: LastlinkWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return jsonError("invalid_json", 400);
  }

  if (payload.Event !== CONFIRMED_EVENT) {
    // Evento que não nos interessa (ex.: fatura pendente, reembolso) —
    // responde 200 para a Lastlink não ficar reenviando.
    return NextResponse.json({ received: true, ignored: true });
  }

  const requiredProductId = process.env.LASTLINK_PRODUCT_ID;
  if (requiredProductId) {
    const products = payload.Data?.Products ?? [];
    const matchesProduct = products.some((p) => p.Id === requiredProductId);
    if (!matchesProduct) {
      return NextResponse.json({ received: true, ignored: true, reason: "product_mismatch" });
    }
  }

  const buyer = payload.Data?.Buyer;
  if (!buyer?.Email) {
    return jsonError("missing_buyer_email", 400);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Webhook da Lastlink recebido, mas o Supabase ainda não está configurado.");
    return jsonError("supabase_not_configured", 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.inviteUserByEmail(buyer.Email, {
    data: { full_name: buyer.Name ?? "" },
    redirectTo: `${request.nextUrl.origin}/onboarding`,
  });

  // Reenvio de webhook ou renovação de assinatura para um email que já tem
  // conta — não é um erro do nosso lado, apenas não há nada novo a criar.
  if (error && !/already.*registered|already.*exists/i.test(error.message)) {
    console.error("Erro ao convidar usuário via webhook da Lastlink:", error.message);
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ received: true });
}
