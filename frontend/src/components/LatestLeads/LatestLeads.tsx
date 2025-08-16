import { Badge, Button, Card, CardFooter } from "@chakra-ui/react";
import { MapPin, Star, Eye } from "lucide-react";

const LatestLeads = () => {
  const leads = [
    {
      id: 1,
      title: "Premium CRM Software Lead",
      category: "Technology",
      location: "New York, NY",
      price: "$2,500",
      rating: 4.8,
      views: 128,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
      type: "Service"
    },
    {
      id: 2,
      title: "Luxury Property Investment",
      category: "Real Estate",
      location: "Los Angeles, CA",
      price: "$15,000",
      rating: 4.9,
      views: 256,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop",
      type: "Product"
    },
    {
      id: 3,
      title: "Electric Vehicle Fleet",
      category: "Automotive",
      location: "Chicago, IL",
      price: "$8,750",
      rating: 4.7,
      views: 189,
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&h=200&fit=crop",
      type: "Product"
    },
    {
      id: 4,
      title: "Digital Marketing Services",
      category: "Business",
      location: "Miami, FL",
      price: "$3,200",
      rating: 4.6,
      views: 97,
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=300&h=200&fit=crop",
      type: "Service"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest Ads</h2>
          <p className="text-muted-foreground">
            Discover the newest lead opportunities in your area
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leads.map((lead) => (
            <Card.Root key={lead.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={lead.image} 
                  alt={lead.title}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-primary">
                  {lead.type}
                </Badge>
              </div>
              
              <Card.Body className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{lead.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{lead.category}</p>
                
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {lead.location}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm">{lead.rating}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 mr-1" />
                    {lead.views}
                  </div>
                </div>
              </Card.Body>
              
              <Card.Footer className="p-4 pt-0 flex items-center justify-between">
                <span className="text-lg font-bold text-primary">{lead.price}</span>
                <Button size="sm">View Details</Button>
              </Card.Footer>
            </Card.Root>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestLeads;