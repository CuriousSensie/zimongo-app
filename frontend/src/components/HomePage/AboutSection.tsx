import React from "react";

const AboutSection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="relative">
            <div className="bg-gray-100 rounded-3xl overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
                alt="Business meeting"
                className="w-full h-80 lg:h-96 object-cover"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8">
            <div>
              <div className="flex flex-row gap-2 items-center mb-3">
                <p className="text-orange-500 font-medium">About</p>
                <div className="h-1 w-10 bg-orange-500 mt-1"></div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 leading-tight">
                <p className="font-extrabold">We Recommend</p>
                 Trusted Factories Every Month
              </h2>
              <p className="mt-6 text-gray-600">
                Get exclusive access to verified factories and suppliers,
                carefully selected to match your business needs.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center bg-gray-50 p-4 rounded-lg shadow">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 ">
                  2000+
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Verified Factories
                </div>
              </div>
              <div className="text-center bg-gray-50 p-4 rounded-lg shadow">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                  100+
                </div>
                <div className="text-sm text-gray-600 mt-1">Countries</div>
              </div>
              <div className="text-center bg-gray-50 p-4 rounded-lg shadow">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                  30+
                </div>
                <div className="text-sm text-gray-600 mt-1">Industries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
