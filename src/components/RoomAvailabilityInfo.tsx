
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Users, Home } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type RoomType = Database['public']['Enums']['room_type'];

interface RoomAvailabilityInfoProps {
  roomType: RoomType;
}

const RoomAvailabilityInfo = ({ roomType }: RoomAvailabilityInfoProps) => {
  const { data: roomStats, isLoading } = useQuery({
    queryKey: ['room-availability', roomType],
    queryFn: async () => {
      // Get total rooms of this type
      const { data: totalRooms, error: totalError } = await supabase
        .from('rooms')
        .select('id')
        .eq('type', roomType)
        .eq('is_available', true);
      
      if (totalError) throw totalError;

      // Get currently occupied rooms for today
      const today = new Date().toISOString().split('T')[0];
      const { data: occupiedRooms, error: occupiedError } = await supabase
        .from('bookings')
        .select('room_id, rooms!inner(type)')
        .eq('rooms.type', roomType)
        .in('status', ['confirmed', 'checked_in'])
        .lte('check_in_date', today)
        .gt('check_out_date', today);
      
      if (occupiedError) throw occupiedError;

      const total = totalRooms?.length || 0;
      const occupied = occupiedRooms?.length || 0;
      const available = Math.max(0, total - occupied);

      return { total, occupied, available };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  if (isLoading || !roomStats) {
    return (
      <div className="flex items-center space-x-4 mt-2">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 mt-2">
      <div className="flex items-center space-x-1">
        <Home className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-600">Total: {roomStats.total}</span>
      </div>
      <Badge 
        variant="outline" 
        className={`${roomStats.available > 0 ? 'text-green-600 border-green-600' : 'text-yellow-600 border-yellow-600'}`}
      >
        Available: {roomStats.available}
      </Badge>
      <Badge variant="outline" className="text-red-600 border-red-600">
        Occupied: {roomStats.occupied}
      </Badge>
    </div>
  );
};

export default RoomAvailabilityInfo;
