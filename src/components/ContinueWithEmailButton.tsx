
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import EmailCollectionDialog from './EmailCollectionDialog';

const ContinueWithEmailButton = () => {
  return (
    <EmailCollectionDialog>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 border-hotel-gold text-hotel-navy hover:bg-hotel-gold hover:text-white transition-colors"
      >
        <Mail className="h-4 w-4" />
        Continue with Email
      </Button>
    </EmailCollectionDialog>
  );
};

export default ContinueWithEmailButton;
