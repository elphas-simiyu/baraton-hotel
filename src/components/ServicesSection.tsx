
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
  Users,
  Sparkles,
  Shirt,
  Plane
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ServicesSection = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const getServiceIcon = (serviceName: string, category: string) => {
    const name = serviceName.toLowerCase();
    const cat = category.toLowerCase();
    
    if (name.includes('restaurant') || name.includes('dining')) return Utensils;
    if (name.includes('fitness') || name.includes('gym')) return Dumbbell;
    if (name.includes('wifi') || name.includes('internet')) return Wifi;
    if (name.includes('parking') || name.includes('valet')) return Car;
    if (name.includes('pool') || name.includes('swimming')) return Waves;
    if (name.includes('coffee') || name.includes('lounge')) return Coffee;
    if (name.includes('security')) return Shield;
    if (name.includes('room service')) return Clock;
    if (name.includes('business') || name.includes('center')) return Users;
    if (name.includes('concierge')) return Headphones;
    if (name.includes('event') || name.includes('planning')) return Calendar;
    if (name.includes('spa') || name.includes('treatment')) return Sparkles;
    if (name.includes('laundry')) return Shirt;
    if (name.includes('airport') || name.includes('transfer')) return Plane;
    
    // Default icons by category
    if (cat.includes('dining')) return Utensils;
    if (cat.includes('fitness')) return Dumbbell;
    if (cat.includes('business')) return Briefcase;
    if (cat.includes('transportation')) return Car;
    if (cat.includes('recreation')) return Waves;
    if (cat.includes('wellness')) return Sparkles;
    if (cat.includes('housekeeping')) return Shirt;
    
    return Coffee; // Default icon
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6">
              World-Class Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading our available services...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
          {services?.map((service, index) => {
            const IconComponent = getServiceIcon(service.name, service.category);
            
            return (
              <Card key={service.id} className={`text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-hotel-gold/10 rounded-full mb-4">
                    <IconComponent className="h-8 w-8 text-hotel-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-hotel-navy mb-3">{service.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{service.description}</p>
                  {service.price && (
                    <p className="text-hotel-gold font-semibold">
                      KSh {(service.price / 100).toLocaleString()}
                    </p>
                  )}
                  {!service.price && (
                    <p className="text-green-600 font-semibold">Complimentary</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
