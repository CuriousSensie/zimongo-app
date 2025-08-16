import { getServerSession } from "next-auth";
import ClientRoot from "./layout.client";
import "@/css/satoshi.css";
import { Inter } from "next/font/google";
import "@/css/style.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning={true}>
        <ClientRoot session={session}>{children}</ClientRoot>
      </body>
    </html>
  );
}
