"use client";

import React, { useState, useEffect } from "react";
import Loader from "@/components/common/Loader";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeContextProvider from "@/context/ThemeContext";
import { SocketProvider } from "@/providers/socket";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/sonner";

export default function ClientRoot({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <SessionProvider session={session}>
      <ToastContainer style={{ zIndex: 99999 }} />
      <ThemeContextProvider>
        <ChakraProvider value={defaultSystem}>
          <SocketProvider>
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
              {loading ? <Loader /> : children}
            </div>
            <Toaster />
          </SocketProvider>
        </ChakraProvider>
      </ThemeContextProvider>
    </SessionProvider>
  );
}
