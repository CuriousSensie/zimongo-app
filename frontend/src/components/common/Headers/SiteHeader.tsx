"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import FullTextLogo from "../../Logos/FullTextLogo";
import SiteDropdown from "../../HeaderDropdown/SiteDropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locationService } from "@/utils/country-state-city";

const SiteHeader = ({ className }: { className?: string }) => {
  const [cities, setCities] = React.useState<{ name: string; code: string }[]>(
    []
  );

  useEffect(() => {
    const fetchCities = async () => {
      const cities = await locationService.getCities("PK", "PB");
      setCities(cities);
    };

    fetchCities();
  }, []);
  return (
    // custom styling from parent (make sure it doesnt conflict)
    <div className={`${className} w-full h-[8vh] bg-zimongo-header-base`}>
      <header
        id="header"
        className="flex h-[8vh] items-center justify-between border-b border-neutral-500 px-4 sm:px-10 bg-zimongo-header-base"
      >
        <Link href={"/"} className="cursor-pointer">
          <FullTextLogo />
        </Link>
        <div className="flex flex-row ">
          <div className="hidden md:flex md:flex-row justify-between gap-3 items-center p-3 md:visible">
            <Link href="/browse" className="hover:underline">
              Browse Leads
            </Link>
            <Select value="">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <SiteDropdown />
          </div>
        </div>
      </header>
    </div>
  );
};

export default SiteHeader;
