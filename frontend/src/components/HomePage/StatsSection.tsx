const StatsSection = () => {
  const stats = [
    { number: "125K", label: "Active Users" },
    { number: "35K", label: "Successful Connections" },
    { number: "14K", label: "Live Leads" },
    { number: "245K", label: "Total Transactions" },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">
                {stat.number}
              </div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;