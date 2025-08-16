import { Card, CardFooter } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { MapPin, Star, Clock, Eye } from "lucide-react";
import Image from "next/image";

const FeaturedAds = () => {
  const featuredLeads = [
    {
      id: 1,
      title: "Enterprise Software Solutions",
      category: "Technology",
      location: "San Francisco, CA",
      price: "$25,000",
      rating: 4.9,
      views: 342,
      timeAgo: "2 hours ago",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
      featured: true,
    },
    {
      id: 2,
      title: "Commercial Real Estate",
      category: "Real Estate",
      location: "New York, NY",
      price: "$45,000",
      rating: 4.8,
      views: 521,
      timeAgo: "4 hours ago",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop",
      featured: true,
    },
    {
      id: 3,
      title: "Healthcare Equipment",
      category: "Healthcare",
      location: "Boston, MA",
      price: "$18,500",
      rating: 4.7,
      views: 289,
      timeAgo: "6 hours ago",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop",
      featured: true,
    },
    {
      id: 4,
      title: "Educational Platform",
      category: "Education",
      location: "Austin, TX",
      price: "$12,000",
      rating: 4.6,
      views: 156,
      timeAgo: "8 hours ago",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop",
      featured: true,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Ads</h2>
          <p className="text-muted-foreground">
            Premium lead opportunities handpicked for maximum value
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredLeads.map((lead) => (
            <Card.Root
              key={lead.id}
              className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-primary/20"
            >
              <Card.Header className="relative overflow-hidden rounded-t-lg">
                <img
                  src={lead.image}
                  alt={lead.title}
                  className="object-cover transition-transform duration-300 ease-in-out hover:scale-105 w-full"
                />

                {/* Featured Badge */}
                <Badge
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium shadow-lg"
                  style={{
                    background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  Featured
                </Badge>

                {/* Time Overlay */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center shadow">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {lead.timeAgo}
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {lead.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {lead.category}
                </p>

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
                <span className="text-lg font-bold text-primary">
                  {lead.price}
                </span>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  Contact Now
                </Button>
              </Card.Footer>
            </Card.Root>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAds;
