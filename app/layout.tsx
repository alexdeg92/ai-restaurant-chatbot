import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RestoBot AI — Chatbot Intelligent pour Restaurants | Perroquet",
  description:
    "Automatisez la prise de commandes, les réservations et le service client de votre restaurant avec notre chatbot IA. Solution québécoise par Perroquet.",
  openGraph: {
    title: "RestoBot AI — Chatbot Intelligent pour Restaurants",
    description:
      "Automatisez la prise de commandes et les réservations avec l'IA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-white overflow-x-hidden">{children}</body>
    </html>
  );
}
