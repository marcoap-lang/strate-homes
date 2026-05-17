import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWARegister } from "@/components/providers/PWARegister";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";
import { WorkspaceProvider } from "@/components/providers/WorkspaceProvider";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerActiveWorkspace } from "@/lib/workspace/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Strate Homes",
  title: {
    default: "Strate Homes",
    template: "%s | Strate Homes",
  },
  description: "Operacion inmobiliaria, inventario, leads y presencia publica para asesores e inmobiliarias.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Strate Homes",
    statusBarStyle: "black-translucent",
    startupImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#17120e",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const initialWorkspace = await getServerActiveWorkspace(session?.user ?? null);

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f6f1e8] text-zinc-950">
        <PWARegister />
        <SupabaseAuthProvider initialSession={session}>
          <WorkspaceProvider initialWorkspace={initialWorkspace}>{children}</WorkspaceProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
