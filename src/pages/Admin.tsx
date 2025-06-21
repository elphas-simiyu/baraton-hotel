import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, Users, Calendar, Home, Eye, EyeOff, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Admin = () => {
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'standard',
    price_per_night: '',
    capacity: '',
    size_sqm: '',
    description: '',
    amenities: '',
    image_url: ''
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple admin authentication (in production, use proper auth)
  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') { // Simple password for demo
      setIsAuthenticated(true);
      toast({
        title: "Welcome Admin",
        description: "You are now logged in to the admin panel.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated
  });

  // Fetch bookings
  const { data: bookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (
            name,
            type
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['booking-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_analytics')
        .select('*')
        .limit(12);
      
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: async (roomData: any) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{
          ...roomData,
          price_per_night: parseInt(roomData.price_per_night) * 100, // Convert to cents
          capacity: parseInt(roomData.capacity),
          size_sqm: roomData.size_sqm ? parseInt(roomData.size_sqm) : null,
          amenities: roomData.amenities ? roomData.amenities.split(',').map((a: string) => a.trim()) : []
        }]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      toast({
        title: "Success",
        description: "Room added successfully!",
      });
      setNewRoom({
        name: '',
        type: 'standard',
        price_per_night: '',
        capacity: '',
        size_sqm: '',
        description: '',
        amenities: '',
        image_url: ''
      });
    },
    onError: (error) => {
      console.error('Error adding room:', error);
      toast({
        title: "Error",
        description: "Failed to add room. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      // First check if room has any bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .limit(1);

      if (bookingsError) throw bookingsError;

      if (bookings && bookings.length > 0) {
        throw new Error('Cannot delete room with existing bookings');
      }

      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      setDeletingRoomId(null);
      toast({
        title: "Success",
        description: "Room deleted successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting room:', error);
      setDeletingRoomId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to delete room. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    addRoomMutation.mutate(newRoom);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (deletingRoomId === roomId) {
      // Confirm deletion
      deleteRoomMutation.mutate(roomId);
    } else {
      // First click - show confirmation
      setDeletingRoomId(roomId);
      setTimeout(() => {
        if (deletingRoomId === roomId) {
          setDeletingRoomId(null);
        }
      }, 3000); // Auto-cancel after 3 seconds
    }
  };

  const totalRevenue = analytics?.reduce((sum, item) => sum + (item.total_revenue || 0), 0) || 0;
  const totalBookings = analytics?.reduce((sum, item) => sum + (item.total_bookings || 0), 0) || 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Demo password: admin123
              </p>
            </div>
            <Button onClick={handleAdminLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-hotel-navy mb-8">Admin Dashboard</h1>
        
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">KSh {(totalRevenue / 100).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Home className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold">{rooms?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Available Rooms</p>
                  <p className="text-2xl font-bold">{rooms?.filter(r => r.is_available).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Room */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Room
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddRoom} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Room Name</Label>
                      <Input
                        id="name"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Room Type</Label>
                      <Select value={newRoom.type} onValueChange={(value) => setNewRoom({...newRoom, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="deluxe">Deluxe</SelectItem>
                          <SelectItem value="executive_suite">Executive Suite</SelectItem>
                          <SelectItem value="conference_suite">Conference Suite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price per Night (KSh)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newRoom.price_per_night}
                          onChange={(e) => setNewRoom({...newRoom, price_per_night: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={newRoom.capacity}
                          onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="size">Size (sqm)</Label>
                      <Input
                        id="size"
                        type="number"
                        value={newRoom.size_sqm}
                        onChange={(e) => setNewRoom({...newRoom, size_sqm: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="amenities">Amenities (comma separated)</Label>
                      <Input
                        id="amenities"
                        value={newRoom.amenities}
                        onChange={(e) => setNewRoom({...newRoom, amenities: e.target.value})}
                        placeholder="WiFi, TV, Air Conditioning, Mini Bar"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        type="url"
                        value={newRoom.image_url}
                        onChange={(e) => setNewRoom({...newRoom, image_url: e.target.value})}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={addRoomMutation.isPending}>
                      {addRoomMutation.isPending ? 'Adding...' : 'Add Room'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Rooms List */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {roomsLoading ? (
                      <p>Loading rooms...</p>
                    ) : (
                      rooms?.map((room) => (
                        <div key={room.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{room.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={room.is_available ? "default" : "secondary"}>
                                {room.is_available ? "Available" : "Unavailable"}
                              </Badge>
                              <Button
                                variant={deletingRoomId === room.id ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => handleDeleteRoom(room.id)}
                                disabled={deleteRoomMutation.isPending}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {deletingRoomId === room.id && (
                            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              Click delete again to confirm removal
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                          <div className="text-sm space-y-1">
                            <p><strong>Type:</strong> {room.type.replace('_', ' ')}</p>
                            <p><strong>Price:</strong> KSh {(room.price_per_night / 100).toLocaleString()}/night</p>
                            <p><strong>Capacity:</strong> {room.capacity} guests</p>
                            {room.size_sqm && <p><strong>Size:</strong> {room.size_sqm} sqm</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings?.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{booking.guest_name}</h3>
                          <p className="text-sm text-gray-600">{booking.guest_email}</p>
                        </div>
                        <Badge className={`${
                          booking.status === 'confirmed' ? 'bg-green-500' :
                          booking.status === 'pending' ? 'bg-yellow-500' :
                          booking.status === 'cancelled' ? 'bg-red-500' :
                          'bg-gray-500'
                        } text-white`}>
                          {booking.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Room</p>
                          <p className="font-medium">{booking.rooms?.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-in</p>
                          <p className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-medium">KSh {(booking.total_amount / 100).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.map((item) => (
                      <div key={item.month} className="flex justify-between items-center">
                        <span>{new Date(item.month || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                        <span className="font-semibold">KSh {((item.total_revenue || 0) / 100).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.map((item) => (
                      <div key={item.month} className="flex justify-between items-center">
                        <span>{new Date(item.month || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                        <span className="font-semibold">{item.total_bookings || 0} bookings</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
