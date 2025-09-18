"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import useUser from "@/hooks/useUser";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  ChevronDown,
  ExternalLink,
  User,
} from "lucide-react";
import { extractSubdomain } from "@/utils/subdomain";
import Image from "next/image";
import Avatar from "../../../public/avatar.png";
import { NEXT_PUBLIC_S3_BASE_URL } from "@/constant/env";
import { toast } from "sonner";

const SiteDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const host = window.location.host;

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);
  const user = useUser();

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className="relative z-999" ref={dropdown}>
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="group flex flex-row-reverse items-center gap-2 rounded-full px-2 py-1 transition duration-200 hover:ring-2 hover:ring-[#1F2937]"
        href="#"
      >
        <ChevronDown
          color="#9CA3AF"
          className={`transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />

        <span className="hidden text-left lg:block">
          <span className="block text-sm font-medium text-[#1F2937] dark:text-white">
            {user?.me ? user?.me.name : "user"}
          </span>
        </span>

        <div className="h-[5vh] w-[5vh] overflow-hidden rounded-full border border-stroke shadow-lg">
          <Image
            src={
              user?.me?.picture?.path
                ? `${NEXT_PUBLIC_S3_BASE_URL}/${user?.me?.picture?.path}`
                : Avatar
            }
            alt="Avatar"
            height={40}
            width={40}
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
            className="w-[6vh] h-[6vh] rounded-full items-center"
          />
        </div>
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen === true ? "block" : "hidden"
        }`}
      >
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          <li className="md:hidden">
            <Link
              href="/browse"
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-[#1F2937] lg:text-base"
            >
              <ExternalLink className="w-6 h-6" />
              Browse Leads
            </Link>
          </li>
          <li className="md:hidden">
            <Link
              href="/getting-started"
              className=" flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-[#1F2937] lg:text-base"
            >
              <ExternalLink className="w-6 h-6" />
              Post a Lead
            </Link>
          </li>
          <li className="md:hidden">
            <Link
              href="#contact"
              className=" hove#1F2937] flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out lg:text-base"
            >
              <ExternalLink className="w-6 h-6" />
              Service Offered
            </Link>
          </li>
          <li>
            <Link
              target={!user?.me ? "_self" : "_blank"}
              rel="noreferrer noopener"
              href={
                !user?.me
                  ? "/signin"
                  : user?.me?.profileSlug &&
                      (host.includes("localhost") || host.includes("127.0.0.1"))
                    ? `http://${user?.me?.profileSlug}.${host}/`
                    : user?.me?.profileSlug &&
                        !host.includes("localhost") &&
                        !host.includes("127.0.0.1")
                      ? `https://${user?.me?.profileSlug}.${host}/`
                      : `/profile-setup`
              }
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-[#1F2937] lg:text-base border-t border-stroke pt-5 dark:border-strokedark md:border-t-0 md:pt-0"
            >
              {user?.me ? (
                <User className="w-6 h-6" />
              ) : (
                <ArrowRightFromLine className="w-6 h-6" />
              )}
              {!user?.me ? "Signin" : "My Dashboard"}
            </Link>
          </li>
        </ul>
        {user?.me && (
          <button
            onClick={() => {
              // Check if current URL has a subdomain

              const hostname = window.location.hostname;
              const subdomain = extractSubdomain(hostname);

              let callbackUrl = "/signin";

              signOut({ callbackUrl }).then(() => {
                window.location.href = callbackUrl;
              });

              toast.success("You have been Logout", {
                duration: 3000,
                action: {
                  label: "Close",
                  onClick: () => toast.dismiss(),
                },
              });
            }}
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-[#1F2937] lg:text-base"
          >
            <ArrowLeftFromLine className="w-6 h-6" />
            Log Out
          </button>
        )}
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default SiteDropdown;
