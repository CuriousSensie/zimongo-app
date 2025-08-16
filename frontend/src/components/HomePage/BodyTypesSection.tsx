const BodyTypesSection = () => {
  const leadTypes = [
    { name: "B2B Sales", color: "bg-red-500", count: "8.5k" },
    { name: "Services", color: "bg-purple-500", count: "12.3k" },
    { name: "Technology", color: "bg-blue-500", count: "6.7k" },
    { name: "Healthcare", color: "bg-green-500", count: "4.2k" },
    { name: "Education", color: "bg-orange-500", count: "5.8k" },
    { name: "Real Estate", color: "bg-indigo-500", count: "9.1k" },
    { name: "Finance", color: "bg-pink-500", count: "3.9k" },
    { name: "Retail", color: "bg-teal-500", count: "7.4k" },
    { name: "Manufacturing", color: "bg-yellow-500", count: "2.6k" },
    { name: "Consulting", color: "bg-gray-500", count: "5.3k" },
    { name: "Marketing", color: "bg-rose-500", count: "8.9k" },
    { name: "Legal", color: "bg-violet-500", count: "1.8k" },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Leads By Body Types</h2>
          <p className="text-muted-foreground">
            Explore leads across different industry categories
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {leadTypes.map((type, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className={`${type.color} rounded-lg h-20 w-full mb-3 flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform`}>
                {type.count}
              </div>
              <h3 className="font-medium text-sm">{type.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BodyTypesSection;