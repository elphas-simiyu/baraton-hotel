
// import React, { useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import { Mail } from 'lucide-react';

// interface EmailCollectionDialogProps {
//   children: React.ReactNode;
// }

// const EmailCollectionDialog = ({ children }: EmailCollectionDialogProps) => {
//   const [email, setEmail] = useState('');
//   const [isOpen, setIsOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email) {
//       toast({
//         title: "Error",
//         description: "Please enter your email address",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const { error } = await supabase
//         .from('user_sessions')
//         .insert([
//           { 
//             email: email.toLowerCase().trim(),
//             last_activity: new Date().toISOString()
//           }
//         ]);

//       if (error) throw error;

//       // Store email in localStorage for future use
//       localStorage.setItem('userEmail', email.toLowerCase().trim());

//       toast({
//         title: "Success!",
//         description: "Your email has been saved. You can now track your bookings and services.",
//       });

//       setIsOpen(false);
//       setEmail('');
//     } catch (error) {
//       console.error('Error saving email:', error);
//       toast({
//         title: "Error",
//         description: "Failed to save your email. Please try again.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         {children}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Mail className="h-5 w-5 text-hotel-gold" />
//             Continue with Email
//           </DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleEmailSubmit} className="space-y-4">
//           <div>
//             <Label htmlFor="email">Email Address</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="Enter your email address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <p className="text-sm text-gray-600 mt-1">
//               We'll use this to keep track of your bookings and services.
//             </p>
//           </div>
//           <Button 
//             type="submit" 
//             className="w-full"
//             disabled={isLoading}
//           >
//             {isLoading ? 'Saving...' : 'Continue'}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EmailCollectionDialog;
