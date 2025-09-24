import React from "react";

const CTASection = () => {
  return (
    <section className="bg-gradient-to-r from-orange-50 to-red-50 py-16 lg:py-24 mx-20 mb-12 rounded-3xl shadow-lg">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 mb-6">
          <p className="font-extrabold">
            Don't Miss the Opportunity & Connect with
          </p>
          <p>Trusted Business Partners Worldwide</p>
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Your gateway to trusted suppliers and global opportunities
        </p>
        <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl hover:bg-orange-600 transition-colors font-medium text-lg">
          Get started
        </button>
      </div>
    </section>
  );
};

export default CTASection;
