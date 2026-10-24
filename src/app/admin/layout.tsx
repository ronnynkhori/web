import type { Metadata, Viewport } from "next";
import { Kanit, Montserrat } from "next/font/google";
import { Toaster } from "@/components/admin/ui/sonner";
import { TooltipProvider } from "@/components/admin/ui/tooltip";
import "@/styles/admin.css";

const kanit = Kanit({ weight: ["600", "700", "800"], subsets: ["latin", "latin-ext"], variable: "--font-kanit", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin", "latin-ext"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Sala de Controlo · CPLP 2027", template: "%s · Sala de Controlo" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0A2A66" };

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="pt" className={`${kanit.variable} ${montserrat.variable}`}>
      <body>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <Toaster position="top-center" richColors={false} closeButton />
      </body>
    </html>
  );
}
