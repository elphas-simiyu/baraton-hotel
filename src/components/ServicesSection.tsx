
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Utensils, 
  Dumbbell, 
  Wifi, 
  Car, 
  Calendar, 
  Headphones, 
  Briefcase, 
  Waves,
  Coffee,
  Shield,
  Clock,
  Users
} from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Utensils,
      title: "Fine Dining Restaurant",
      description: "Experience exquisite cuisine prepared by our world-class chefs using locally sourced ingredients."
    },
    {
      icon: Briefcase,
      title: "Conference Facilities",
      description: "State-of-the-art meeting rooms and conference halls equipped with modern presentation technology."
    },
    {
      icon: Dumbbell,
      title: "Fitness Center",
      description: "24/7 access to our fully equipped gymnasium with modern exercise equipment and personal trainers."
    },
    {
      icon: Waves,
      title: "Swimming Pool",
      description: "Relax and unwind in our heated outdoor swimming pool with panoramic views of the landscape."
    },
    {
      icon: Car,
      title: "Valet Parking",
      description: "Complimentary valet parking service available 24/7 for all our guests' convenience."
    },
    {
      icon: Wifi,
      title: "High-Speed WiFi",
      description: "Complimentary high-speed internet access throughout the property for business and leisure."
    },
    {
      icon: Coffee,
      title: "Coffee Lounge",
      description: "Premium coffee and light refreshments available in our elegant lobby lounge area."
    },
    {
      icon: Shield,
      title: "24/7 Security",
      description: "Round-the-clock security service ensuring the safety and comfort of all our guests."
    },
    {
      icon: Calendar,
      title: "Event Planning",
      description: "Professional event coordination services for weddings, conferences, and special occasions."
    },
    {
      icon: Headphones,
      title: "Concierge Service",
      description: "Our dedicated concierge team is available to assist with tours, transportation, and reservations."
    },
    {
      icon: Clock,
      title: "Room Service",
      description: "24-hour room service featuring our full menu selection delivered to your room."
    },
    {
      icon: Users,
      title: "Business Center",
      description: "Fully equipped business center with printing, scanning, and secretarial services."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6 animate-fade-in">
            World-Class Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-in">
            Discover our comprehensive range of premium services designed to exceed your expectations 
            and create unforgettable experiences during your stay.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className={`text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-hotel-gold/10 rounded-full mb-4">
                  <service.icon className="h-8 w-8 text-hotel-gold" />
                </div>
                <h3 className="text-lg font-semibold text-hotel-navy mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Special Features Section */}
        <div className="mt-20 bg-gradient-to-r from-hotel-navy to-hotel-navy-light rounded-3xl p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-6">Why Choose Baraton Community & Research Center?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl font-bold text-hotel-gold mb-2">50+</div>
              <p className="text-lg">Years of Excellence</p>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="text-4xl font-bold text-hotel-gold mb-2">98%</div>
              <p className="text-lg">Guest Satisfaction</p>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="text-4xl font-bold text-hotel-gold mb-2">24/7</div>
              <p className="text-lg">Premium Service</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
