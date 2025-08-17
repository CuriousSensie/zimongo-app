"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import SideBar from "@/components/dynamicSidebars/SideBar";
import Image from "next/image";
import { Settings, LogOut } from "lucide-react";
import useUser from "@/hooks/useUser";
import { getUserSidebarItems } from "./sidebarItems/userSidebarItems";
import { AdminSidebarItems } from "./sidebarItems/adminItems";
AdminSidebarItems

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const UserSidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { me } = useUser() || {};

  // Fix: Handle both string and object cases for company
  const userId = me?._id

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  let storedSidebarExpanded = "true";
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true",
  );

  //setting isAdmin to true or false based on the user role
  const isAdmin = me?.isAdmin || false;
  //const isAdmin = false;

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  if (!me) return null;

  return (
    <>
      <aside
        ref={sidebar}
        className={`absolute left-0 top-0 z-9999 flex h-screen w-[60%] max-w-65 flex-col overflow-y-hidden bg-white duration-300 ease-linear dark:bg-white lg:static lg:w-[18%] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="no-scrollbar flex flex-grow flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="">
            <ul className="flex flex-col gap-2">
              {isAdmin ? (
                <SideBar
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  items={AdminSidebarItems}
                />
              ) : (
                <SideBar
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  items={getUserSidebarItems(userId)}
                />
              )}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
