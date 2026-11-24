import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/inter";
import "./site.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://www.elevenangles.com"),
  title: "TEAM Communications | Every Angle Tells a Story",
  description: "UAE-based strategic multimedia and creative agency for events, production, talent and brand experiences.",
  alternates: { canonical: "/" },
  icons: { icon: "/media/team.webp" },
  openGraph: {
    type: "website",
    title: "TEAM Communications | Moments People Keep",
    description: "Strategic multimedia, entertainment and creative experiences from the UAE.",
    images: [{ url: "/media/hero.webp", alt: "A concert audience lit in violet" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function Layout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
