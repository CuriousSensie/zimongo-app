import React from "react";
import { Star } from "lucide-react";

const TestimonialSection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <p className="text-orange-500 font-medium mb-2">
                What they say
                <span className="ml-2 inline-block h-[2px] w-8 bg-orange-500 align-middle"></span>
              </p>

              <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 leading-tight">
                <p className="font-extrabold">What Our Customers</p>
                <p>Say About Us</p>
              </h2>
            </div>

            {/* Testimonial */}
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop&crop=face"
                  alt="John David"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">JOHN DAVID</h4>
                  <p className="text-sm text-gray-600">CEO</p>
                </div>
              </div>

              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <blockquote className="text-gray-700 leading-relaxed">
                "I have been using this platform to expand my manufacturing and
                business connections. The quality of connections I've made here
                has been exceptional. The platform's user-friendly interface and
                comprehensive database of manufacturers have significantly
                streamlined my sourcing process. I highly recommend this
                platform to anyone looking to grow their network and establish
                meaningful business relationships."
              </blockquote>
            </div>
          </div>

          {/* Right Images Grid */}
          <div className="relatie">
            <div className="grid grid-cols-3 gap-2">
              {[
                "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
              ].map((src, index) => (
                <div
                  key={index}
                  className={`bg-gray-100 rounded-lg overflow-hidden ${index === 4 ? "col-span-2 row-span-2" : ""}`}
                >
                  <img
                    src={src}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-fill"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
