import React from "react";
import { Code, Factory, Leaf, PenTool } from "lucide-react";

const ManufacturingSection = () => {
  const categories = [
    {
      title: "Manufacturing",
      subtitle: "Trusted Manufacturing Solutions",
      icon: <Factory size={20} />,
    },
    {
      title: "Environment Services",
      subtitle: "Smart Environmental Services",
      icon: <Leaf size={20} />,
    },
    {
      title: "IT Services",
      subtitle: "Innovative IT Solutions",
      icon: <Code size={20} />,
    },
    {
      title: "Design Services",
      subtitle: "Creative Design Services",
      icon: <PenTool size={20} />,
    },
  ];

  const companies = [
    {
      id: 1,
      name: "Manufacturing",
      year: "2009",
      icon: <Factory />,
      image:
        "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      id: 2,
      name: "Environmental Services",
      year: "2009",
      icon: <Leaf />,
      image:
        "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      id: 3,
      name: "IT Services",
      year: "2009",
      icon: <Code />,
      image:
        "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      id: 4,
      name: "Manufacturing",
      year: "2009",
      icon: <Factory />,
      image:
        "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      id: 5,
      name: "Environmental Services",
      year: "2009",
      icon: <Leaf />,
      image:
        "https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      id: 6,
      name: "IT Services",
      year: "2009",
      icon: <Code />,
      image:
        "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top card */}
        <div className="relative rounded-[40px] bg-gray-100 shadow-md text-center px-6 py-14 lg:py-16">
          <p className="text-orange-500 font-medium mb-2">
            Top Manufacturer
            <span className="ml-2 inline-block h-[2px] w-8 bg-orange-500 align-middle"></span>
          </p>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Let&apos;s <span className="text-gray-900 font-bold">Discover</span>{" "}
            Your Ideal
            <br className="hidden md:block" /> Manufacturing Partner Here!
          </h2>

          <p className="text-gray-600 max-w-xl mx-auto">
            Find the perfect factory that matches your vision and business
            goals.
          </p>

          {/* Floating Category Bar */}
          <div
            className="
        absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[90%] md:translate-y-2/3
        flex flex-wrap items-center justify-center gap-3
        bg-white rounded-[30px] shadow-xl
        px-4 py-4 w-[95%] sm:w-[90%] md:w-[85%]
      "
          >
            {categories.map((c, idx) => (
              <div
                key={idx}
                className={`
            flex flex-col sm:flex-row items-center sm:items-start
            gap-2 px-4 py-3 border-gray-200
            flex-shrink ${idx === categories.length - 1 ? "border-r-0" : "sm:border-r-2  last:border-r-0"}
          `}
              >
                <div className="flex items-center justify-center w-8 h-8 my-auto rounded-full bg-orange-50 text-orange-500">
                  {c.icon}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {c.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {c.subtitle}
                  </p>
                </div>
              </div>
            ))}

            {/* CTA Button */}
            <button
              className="
          bg-orange-500 text-white text-sm font-semibold
          px-6 py-3 rounded-2xl hover:bg-orange-600 transition
          w-full sm:w-auto
        "
            >
              Get started
            </button>
          </div>
        </div>

        {/* Company Grid */}
        <div className="mt-96 md:mt-36 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border-2 border-gray-300"
            >
              <div className="p-2 rounded-lg">
                <img
                  src={company.image}
                  alt={company.name}
                  className="w-full h-48 object-cover border-3 border-white rounded-lg shadow-md"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-xs bg-white text-orange-500 ">
                        {company.icon}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {company.name}
                    </span>
                  </div>
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {company.year}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="text-center">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-colors font-medium">
            View more
          </button>
        </div>
      </div>
    </section>
  );
};

export default ManufacturingSection;
