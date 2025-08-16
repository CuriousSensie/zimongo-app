import { Card } from "@chakra-ui/react";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Testimonials</h2>
        <p className="text-xl opacity-90 mb-12">
          See what our successful lead generators are saying about Zimongo
        </p>
        
        <Card.Root className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <Card.Description className="p-8">
            <Quote className="h-12 w-12 mx-auto mb-6 opacity-60" />
            <blockquote className="text-xl italic mb-6">
              "Zimongo has revolutionized how we generate and manage leads. The quality of connections and the ease of use is unmatched. We've seen a 300% increase in qualified leads since joining."
            </blockquote>
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" 
                alt="Client" 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">Michael Rodriguez</p>
                <p className="text-sm opacity-75">CEO, TechFlow Solutions</p>
              </div>
            </div>
          </Card.Description>
        </Card.Root>
      </div>
    </section>
  );
};

export default TestimonialsSection;