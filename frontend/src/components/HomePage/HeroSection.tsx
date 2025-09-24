import React from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeroSection = () => {
  return (
    <section className="bg-gray-50 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <div className="flex flex-row gap-2 items-center mb-3">
                <p className="text-orange-500 font-medium">What we give</p>
                <div className="h-1 w-10 bg-orange-500 mt-1"></div>
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-semibold text-gray-900 leading-tight">
                <p className="italic font-extrabold">One Platform.</p>
                <p className="font-medium">Endless</p>
                <p className="font-medium">Connections</p>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-md">
                Connect with manufacturers, freelancers, and service providers
                near you
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex w-full mx-auto max-w-2xl overflow-hidden rounded-full border-4 border-orange-500 bg-white shadow-sm z-999">
              {/* Dropdown */}
              <Select value="">
                <SelectTrigger className="w-1/4 h-full flex items-center rounded-none gap-1 px-4 py-3 ">
                  <SelectValue placeholder="Lead Type" />
                </SelectTrigger>
                <SelectContent className="w-1/4 h-full ml-3">
                  <SelectItem value={"buy"}>Buy Leads</SelectItem>
                  <SelectItem value={"sell"}>Sell Leads</SelectItem>
                </SelectContent>
              </Select>

              {/* Divider */}
              <div className="w-px bg-gray-300" />

              {/* Input */}
              <input
                type="text"
                placeholder="Enter product / Service to search"
                className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />

              {/* Search Button */}
              <button className="w-1/4 flex items-center gap-1 px-5 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition">
                <Search size={18} className="text-white" />
                Search
              </button>
            </div>
          </div>

          {/* Right Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-black rounded-2xl overflow-hidden h-48">
                  <img
                    src="https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop"
                    alt="Office meeting"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gray-100 rounded-2xl overflow-hidden h-32">
                  <img
                    src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=130&fit=crop"
                    alt="Business discussion"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-gray-100 rounded-2xl overflow-hidden h-32">
                  <img
                    src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=130&fit=crop"
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-black rounded-2xl overflow-hidden h-48">
                  <img
                    src="https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop"
                    alt="Professional workspace"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
