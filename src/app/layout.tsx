import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Strate Homes",
  description: "Premium real estate SaaS for agents, teams and agencies.",
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
        <SupabaseAuthProvider initialSession={session}>
          <WorkspaceProvider initialWorkspace={initialWorkspace}>{children}</WorkspaceProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
