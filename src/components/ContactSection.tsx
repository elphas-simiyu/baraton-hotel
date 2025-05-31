
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6 animate-fade-in">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-in">
            Ready to experience exceptional hospitality? Contact us today to make your reservation 
            or inquire about our services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8 animate-slide-in">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-hotel-navy mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-hotel-gold/10 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-hotel-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-hotel-navy">Address</h4>
                      <p className="text-gray-600">University of Eastern Africa, Baraton<br />P.O. Box 2500, Eldoret 30100<br />Kenya</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-hotel-gold/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-hotel-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-hotel-navy">Phone</h4>
                      <p className="text-gray-600">+254 53 2013 412<br />+254 700 123 456</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-hotel-gold/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-hotel-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-hotel-navy">Email</h4>
                      <p className="text-gray-600">reservations@baraton.ac.ke<br />info@baraton.ac.ke</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-hotel-gold/10 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-hotel-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-hotel-navy">Reception Hours</h4>
                      <p className="text-gray-600">24/7 Front Desk Service<br />Concierge: 6:00 AM - 10:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-hotel-navy to-hotel-navy-light text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Special Offers</h3>
                <p className="mb-4">Book directly with us and enjoy exclusive benefits:</p>
                <ul className="space-y-2 text-hotel-gold-light">
                  <li>• Best rate guarantee</li>
                  <li>• Complimentary WiFi</li>
                  <li>• Late checkout (subject to availability)</li>
                  <li>• Welcome drink on arrival</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Form */}
          <Card className="border-0 shadow-lg animate-fade-in">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-hotel-navy mb-6">Send us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <Input placeholder="Your first name" className="border-gray-300 focus:border-hotel-gold focus:ring-hotel-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <Input placeholder="Your last name" className="border-gray-300 focus:border-hotel-gold focus:ring-hotel-gold" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" placeholder="your.email@example.com" className="border-gray-300 focus:border-hotel-gold focus:ring-hotel-gold" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input type="tel" placeholder="+254 700 000 000" className="border-gray-300 focus:border-hotel-gold focus:ring-hotel-gold" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:border-hotel-gold focus:ring-hotel-gold">
                    <option>Room Reservation</option>
                    <option>Event Planning</option>
                    <option>Conference Booking</option>
                    <option>General Inquiry</option>
                    <option>Feedback</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <Textarea 
                    placeholder="How can we help you?" 
                    rows={5}
                    className="border-gray-300 focus:border-hotel-gold focus:ring-hotel-gold"
                  />
                </div>
                
                <Button className="w-full bg-hotel-gold hover:bg-hotel-gold-dark text-hotel-navy font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
