"use client";
import React from "react";
import UserDropdown from "../HeaderDropdown/UserDropdown";
import FullTextLogo from "../Logos/FullTextLogo";
import Link from "next/link";

const UserHeader = ({
  sidebarOpen,
  setSidebarOpen,
  className,
}: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
  className?: string;
}) => {
  return (
    // custom styling from parent (make sure it doesnt conflict)
    <div className={`${className} w-full h-[8vh] bg-zimongo-header-base`}>
      <header
        id="header"
        className="flex h-[8vh] items-center justify-between border-b border-neutral-500 px-4 py-2 sm:px-10 bg-zimongo-header-base"
      >
        {/* left */}
        <div className="flex flex-row gap-2">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "!w-full delay-300"}`}
                />
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "delay-400 !w-full"}`}
                />
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "!w-full delay-500"}`}
                />
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "!h-0 !delay-[0]"}`}
                />
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "!h-0 !delay-200"}`}
                />
              </span>
            </span>
          </button>
          {/* Logo comes from sidebar in large screens */}
          <Link href='/dashboard' className="lg:hidden">
            <FullTextLogo />
          </Link>
        </div>
        <div className="flex flex-row ">
          <div className="hidden md:flex md:flex-row justify-between gap-3 items-center p-3  md:visible mr-10 lg:mr-20">
            {/* <Link href="/browse" className="hover:underline">
              Browse Leads
            </Link>
            <Link href="/browse" className="hover:underline">
              Post a Lead
            </Link>
            <Link href="/browse" className="hover:underline">
              Learn More
            </Link> */}
          </div>

          <UserDropdown />
        </div>
      </header>
    </div>
  );
};

export default UserHeader;
