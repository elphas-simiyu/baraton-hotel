
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Upload } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  price_per_night: number;
  capacity: number;
  size_sqm?: number;
  description?: string;
  amenities?: string[];
  image_url?: string;
  is_available: boolean;
}

interface RoomEditDialogProps {
  room: Room;
}

const RoomEditDialog = ({ room }: RoomEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState({
    name: room.name,
    type: room.type,
    price_per_night: (room.price_per_night / 100).toString(),
    capacity: room.capacity.toString(),
    size_sqm: room.size_sqm?.toString() || '',
    description: room.description || '',
    amenities: room.amenities?.join(', ') || '',
    image_url: room.image_url || '',
    is_available: room.is_available
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `room-${room.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(fileName);

      setEditRoom(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const updateRoomMutation = useMutation({
    mutationFn: async (roomData: any) => {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          name: roomData.name,
          type: roomData.type,
          price_per_night: parseInt(roomData.price_per_night) * 100,
          capacity: parseInt(roomData.capacity),
          size_sqm: roomData.size_sqm ? parseInt(roomData.size_sqm) : null,
          description: roomData.description,
          amenities: roomData.amenities ? roomData.amenities.split(',').map((a: string) => a.trim()) : [],
          image_url: roomData.image_url,
          is_available: roomData.is_available,
          updated_at: new Date().toISOString()
        })
        .eq('id', room.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Room updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: "Failed to update room. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoomMutation.mutate(editRoom);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Room Name</Label>
              <Input
                id="edit-name"
                value={editRoom.name}
                onChange={(e) => setEditRoom({...editRoom, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Room Type</Label>
              <Select value={editRoom.type} onValueChange={(value) => setEditRoom({...editRoom, type: value})}>
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-price">Price per Night (KSh)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editRoom.price_per_night}
                onChange={(e) => setEditRoom({...editRoom, price_per_night: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={editRoom.capacity}
                onChange={(e) => setEditRoom({...editRoom, capacity: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-size">Size (sqm)</Label>
              <Input
                id="edit-size"
                type="number"
                value={editRoom.size_sqm}
                onChange={(e) => setEditRoom({...editRoom, size_sqm: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editRoom.description}
              onChange={(e) => setEditRoom({...editRoom, description: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="edit-amenities">Amenities (comma separated)</Label>
            <Input
              id="edit-amenities"
              value={editRoom.amenities}
              onChange={(e) => setEditRoom({...editRoom, amenities: e.target.value})}
              placeholder="WiFi, TV, Air Conditioning, Mini Bar"
            />
          </div>

          <div>
            <Label htmlFor="edit-image">Room Image</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button type="button" disabled={uploading} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {editRoom.image_url && (
                <div className="mt-2">
                  <img 
                    src={editRoom.image_url} 
                    alt="Room preview" 
                    className="h-20 w-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-available"
              checked={editRoom.is_available}
              onChange={(e) => setEditRoom({...editRoom, is_available: e.target.checked})}
            />
            <Label htmlFor="edit-available">Room Available</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRoomMutation.isPending}>
              {updateRoomMutation.isPending ? 'Updating...' : 'Update Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomEditDialog;
