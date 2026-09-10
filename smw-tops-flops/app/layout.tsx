import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sauces Samourai Tops & Flops",
  description: "Application de vote des Sauces Samourai, White Star Dames 6.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div className="shell">
          <header>
            <div className="brand">
              <div className="brand-text">
                <h1>Sauces Samourai Tops & Flops</h1>
                <p>White Star Dames 6</p>
              </div>

              <div className="team-logos">
                <Image
                  src="/white-star.png"
                  alt="Logo White Star"
                  width={100}
                  height={100}
                  priority
                />
                <Image
                  src="/sauces-samourai.png"
                  alt="Logo Sauces Samourai"
                  width={100}
                  height={100}
                  priority
                />
              </div>
            </div>
          </header>

          <nav aria-label="Navigation principale">
            <Link href="/">Match &amp; vote</Link>
            <Link href="/justifications">Justifications</Link>
            <Link href="/resultats">Résultats</Link>
            <Link href="/admin">Admin</Link>
          </nav>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
