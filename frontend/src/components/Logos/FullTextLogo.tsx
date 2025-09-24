import Image from "next/image";
import React from "react";
import logo from "@/assets/logo.png";

const FullTextLogo = () => {
  return (
    <div className="flex gap-2 h-[8vh] w-auto items-center">
      <img
        src={logo.src}
        alt="Zimongo Company Logo"
        className="h-full w-full"
      />
      <p className="text-2xl md:text-3xl font-bold tracking-wide text-amber-500">
        Zimongo
      </p>
    </div>
  );
};

export default FullTextLogo;
