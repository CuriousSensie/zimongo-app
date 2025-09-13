import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import useUser from "@/hooks/useUser";
import { Tooltip } from "../ui/tooltip";
import FullTextLogo from "../Logos/FullTextLogo";
// import NativeImage from "../NativeImage/NativeImage";
// import useActivities from "@/hooks/useActivities";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    separator?: boolean;
    isTitle?: boolean;
    isAdmin?: boolean;
    isDisabled?: boolean;
  }[];
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, items }: SidebarProps) => {
  const pathname = usePathname();
  const trigger = useRef<any>(null);
  const { me, isLoading} = useUser();
  const isAdmin = me?.isAdmin;

  // TODO: Replace with real data
  // const { activities } = useActivities();
  // const notificationCount = activities?.totalCount;
  
  return (
    <div className="flex h-full max-w-65 flex-col justify-between overflow-y-auto ">
      {/* Logo */}
      <div className="h-[8vh] flex flex-row items-center gap-2 border-b border-neutral-500 px-4 py-2 sm:px-10">
        <button
          ref={trigger}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(!sidebarOpen);
          }}
          className="z-9999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
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
        
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-2xl font-bold text-white"
        >
          <FullTextLogo />
        </Link>
      </div>

      {/* Navigation */}
      <ul className="flex max-w-64 flex-col gap-1 px-4 mt-3">
        {items.map((item, index) => {
          if (item.isAdmin && !isAdmin) return null;

          const isActive = pathname === item.href;
          const baseClass =
            "group relative flex items-center gap-3 rounded-lg px-4 py-2 font-normal text-base transition-all duration-200";

          const activeClass = isActive
            ? "bg-[#F3F4F6] text-[#1F2937]"
            : "hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#1F2937]";

          // if disabled, then show a tooltip
          const disabledClass = item.isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "";

          return (
            <React.Fragment key={index}>
              {!item.isTitle && (
                <li key={`${item.label}-${index}`}>
                  {item.isDisabled ? (
                    <Tooltip
                      content="This feature is currently disabled"
                      showArrow={true}
                    >
                      <div
                        className={`${baseClass} ${activeClass} ${disabledClass}`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${
                            isActive
                              ? "font-medium text-[#1F2937]"
                              : "text-[#4B5563] group-hover:text-[#1F2937]"
                          }`}
                        />
                        <span className="whitespace-pre-line">
                          {item.label}
                        </span>

                        {/* {item.label === "Notifications" && (
                          <span className="ml-5 rounded-full bg-[#E5E7EB] px-2 py-1 text-center">
                            {notificationCount && notificationCount > 99
                              ? "99+"
                              : notificationCount || 0}
                          </span>
                        )} */}
                      </div>
                    </Tooltip>
                  ) : (
                    <Link
                      href={item.href}
                      className={`${baseClass} ${activeClass} ${disabledClass}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`h-4 w-4 ${
                          isActive
                            ? "font-medium text-[#1F2937]"
                            : "text-[#4B5563] group-hover:text-[#1F2937]"
                        }`}
                      />
                      <span className="whitespace-pre-line">{item.label}</span>

                      {/* {item.label === "Notifications" && (
                        <span className="ml-5 rounded-full bg-[#E5E7EB] px-2 py-1 text-center">
                          {notificationCount && notificationCount > 99
                            ? "99+"
                            : notificationCount || 0}
                        </span>
                      )} */}
                    </Link>
                  )}
                </li>
              )}
              {item.separator && (
                <li className="my-2">
                  <hr className="border-gray-200" />
                </li>
              )}
              {item.isTitle && (
                <li>
                  <p className="text-gray-400 px-4 py-2.5 text-xs font-semibold uppercase">
                    {item.label}
                  </p>
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
