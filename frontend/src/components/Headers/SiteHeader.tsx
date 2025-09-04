"use client";
import React from "react";
import Link from "next/link";
import useUser from "@/hooks/useUser";
import FullTextLogo from "../Logos/FullTextLogo";
import SiteDropdown from "../HeaderDropdown/SiteDropdown";

const SiteHeader = ({ className }: { className?: string }) => {
  const user = useUser();

  return (
    // custom styling from parent (make sure it doesnt conflict)
    <div className={`${className} w-full h-[8vh] bg-zimongo-header-base`}>
      <header
        id="header"
        className="flex h-[8vh] items-center justify-between border-b border-neutral-500 px-4 py-2 sm:px-10 bg-zimongo-header-base"
      >
        <Link href={"/"} className="cursor-pointer">
          <FullTextLogo />
        </Link>
        <div className="flex flex-row ">
          <div className="hidden md:flex md:flex-row justify-between gap-3 items-center p-3  md:visible mr-10 lg:mr-20">
            <Link href="/browse" className="hover:underline">
              Browse Leads
            </Link>
            <Link href="/browse" className="hover:underline">
              Post a Lead
            </Link>
            <Link href="/browse" className="hover:underline">
              Learn More
            </Link>
          </div>

          <SiteDropdown />
        </div>
      </header>
    </div>
  );
};

export default SiteHeader;
