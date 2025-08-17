"use client";
import React, { useState } from "react";
import { Progress } from "@chakra-ui/react";
import useUser from "@/hooks/useUser";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserSidebar from "../dynamicSidebars/UserSidebar";
import UserHeader from "../Headers/UserHeader";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useUser();
  const { status } = useSession();
  const router = useRouter();

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen ">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <UserSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className=" flex flex-1 flex-col overflow-y-auto ">
          {/* <!-- ===== Header Start ===== --> */}
          <UserHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main className="bg-zimongo-bg">
            <div className="">
              {status === "loading" || !user ? (
                <div className="">
                  <Progress.Root>
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                    <Progress.Label />
                    <Progress.ValueText />
                  </Progress.Root>
                  <h2 className="text-center text-2xl ">
                    Setting up your session
                  </h2>
                  <h3 className="text-center text-xl ">
                    Try login back in if stuck
                  </h3>
                </div>
              ) : (
                children
              )}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}
