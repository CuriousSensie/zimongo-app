import { Factory, Heart } from "lucide-react";
import React from "react";


const FeaturedProfiles = () => {
  const profiles = [
    {
      id: 1,
      company: "Health Corps",
      category: "Pharma Company",
      icon: Heart,
      description:
        "Leading manufacturer of precision medical equipments and components for artificial limbs.",
      location: "India",
    },
    {
      id: 2,
      company: "Global Sourcing Ltd",
      category: "Manufacturing",
      icon: Factory,
      description:
        "Sustainable steel management and environmental friendly products for global supply.",
      location: "India",
    },
  ];

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12 justify-between ">
        <div className="mb-12">
          <div className="flex flex-row gap-2 items-center mb-3">
            <p className="text-orange-500 font-medium">What we provide</p>
            <div className="h-1 w-10 bg-orange-500 mt-1"></div>
          </div>
          <h2 className="text-3xl lg:text-4xl text-gray-900">
            <p className="font-extrabold min-w-fit">Featured Business Profiles</p>
            <p className="font-normal">For you</p>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl">
            Explore top-rated manufacturers and service providers vetted by our
            experts to meet your industry needs.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border-2 border-transparent hover:border-orange-300 w-full md:w-80"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {profile.icon && <profile.icon className="text-orange-500" size={24} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {profile.company}
                      </h3>
                      <button className="bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded font-medium">
                        Partner
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {profile.category}
                    </p>
                    <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                      {profile.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500">
                        {profile.location}
                      </span>
                      <button className="text-blue-600 text-sm hover:underline">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfiles;
