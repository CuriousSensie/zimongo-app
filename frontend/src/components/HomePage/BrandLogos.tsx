import { Building2, Cpu, Home, GraduationCap, Car } from "lucide-react";

const BrandLogos = () => {
  const categories = [
    { name: "Real Estate", icon: Home, count: "2.5k+" },
    { name: "Automotive", icon: Car, count: "1.8k+" },
    { name: "Technology", icon: Cpu, count: "3.2k+" },
    { name: "Education", icon: GraduationCap, count: "1.5k+" },
    { name: "Business", icon: Building2, count: "2.1k+" },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <category.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
              <p className="text-xs text-muted-foreground">{category.count} leads</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;