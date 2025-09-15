import { getServerSession, Session } from "next-auth";
import ClientRoot from "./layout.client";
import "@/css/satoshi.css";
import "@/css/style.css";

export default async function RootLayout({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClientRoot session={session}>{children}</ClientRoot>
      </body>
    </html>
  );
}
