import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";

import "@/app/globals.css";
import { cn } from "@/lib/utils";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "hviz",
  description: "hviz is a CLI tool for visualizing your database schema",
};

function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(robotoMono.className, "bg-zinc-950")}
      >
        {children}
      </body>
    </html>
  );
}

export default RootLayout;