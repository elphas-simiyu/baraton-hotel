
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
  const { data: roomStats } = useQuery({
    queryKey: ['room-availability', roomType],
    queryFn: async () => {
      // Get total rooms of this type
      const { data: totalRooms, error: totalError } = await supabase
        .from('rooms')
        .select('id')
        .eq('type', roomType)
        .eq('is_available', true);
      
      if (totalError) throw totalError;

      // Get currently occupied rooms
      const today = new Date().toISOString().split('T')[0];
      const { data: occupiedRooms, error: occupiedError } = await supabase
        .from('bookings')
        .select('room_id')
        .in('status', ['confirmed', 'checked_in'])
        .lte('check_in_date', today)
        .gt('check_out_date', today);
      
      if (occupiedError) throw occupiedError;

      const total = totalRooms?.length || 0;
      const occupied = occupiedRooms?.length || 0;
      const available = total - occupied;

      return { total, occupied, available };
    }
  });

  if (!roomStats) return null;

  return (
    <div className="flex items-center space-x-4 mt-2">
      <div className="flex items-center space-x-1">
        <Home className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-600">Total: {roomStats.total}</span>
      </div>
      <Badge variant="outline" className="text-green-600 border-green-600">
        Available: {roomStats.available}
      </Badge>
      <Badge variant="outline" className="text-red-600 border-red-600">
        Occupied: {roomStats.occupied}
      </Badge>
    </div>
  );
};

export default RoomAvailabilityInfo;
