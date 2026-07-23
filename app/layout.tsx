import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Providers } from "./providers";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "GT Contabilidade",
    template: "%s | GT Contabilidade",
  },

  description:
    "Sistema para recuperação e gerenciamento de documentos fiscais.",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body className="overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}