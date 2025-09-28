"use client";
import React, { useState } from "react";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import UserSidebar from "../dynamicSidebars/UserSidebar";
import UserHeader from "../common/Headers/UserHeader";
import { toast } from "sonner";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { me, isLoading } = useUser();
  const router = useRouter();

  // Handle authentication and deactivated accounts
  if (!isLoading && !me) {
    router.push("/signin");
    return null;
  } else if (me?.isDeactivated) {
    toast.error("Your account has been deactivated. Please contact support.", {
      duration: 8000,
      position: "top-center",
      richColors: true,
      action: {
        label: "Close",
        onClick: () => toast.dismiss(),
      },
    });
    router.push("/signin");
    return null;
  }

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen bg-zimongo-bg">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <UserSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
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
          <main className="bg-zimongo-bg mt-[8vh]">
            <div className="">
              {!me || isLoading ? (
                <div className="">
                  <h2 className="text-center text-2xl ">
                    Setting up your session
                  </h2>
                  <h3 className="text-center text-xl ">
                    Try signing in again if you are stuck.
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
