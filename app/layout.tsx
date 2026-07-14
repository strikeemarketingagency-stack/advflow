import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/auth-provider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AdvFlow — O fluxo inteligente do advogado moderno",
  description: "Organize seu escritório jurídico em um único fluxo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full bg-ice-50 text-graphite-900">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-navy-900)",
              color: "white",
              border: "none",
              borderRadius: "1.25rem",
              boxShadow: "var(--shadow-floating)",
            },
          }}
        />
      </body>
    </html>
  );
}
