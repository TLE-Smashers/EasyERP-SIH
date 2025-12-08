import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserProfile } from "@/actions/profile/getUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Mail, Phone, Briefcase, User as UserIcon } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * User Profile Page
 * Displays current user's profile information
 * Following SOLID principles - Single Responsibility
 */
export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = await getUserProfile();

  if (!user) {
    redirect("/login");
  }

  // Generate initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format role display
  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    // <div className="space-y-4 p-2">
    //   {/* Header */}
    //   <div className="flex items-center gap-2 mb-2">
    //     <Link href="/dashboard">
    //       <Button variant="ghost" size="icon" className="h-8 w-8">
    //         <ArrowLeft className="h-4 w-4" />
    //       </Button>
    //     </Link>
    //     <div>
    //       <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
    //       <p className="text-xs text-muted-foreground">Manage your account information</p>
    //     </div>
    //   </div>

    //   <div className="grid gap-3 md:grid-cols-3">
    //     {/* Profile Card */}
    //     <Card className="md:col-span-1">
    //       <CardHeader className="text-center py-3 px-3">
    //         <div className="flex justify-center mb-2">
    //           <Avatar className="h-16 w-16">
    //             {(user as any).image && <AvatarImage src={(user as any).image} alt={user.name} />}
    //             <AvatarFallback className="text-sm">{getInitials(user.name)}</AvatarFallback>
    //           </Avatar>
    //         </div>
    //         <CardTitle className="text-lg">{user.name}</CardTitle>
    //         <CardDescription className="text-xs">{user.email}</CardDescription>
    //         <div className="mt-2 flex justify-center">
    //           <Badge variant="outline" className="capitalize text-xs py-0.5">
    //             {formatRole(user.role)}
    //           </Badge>
    //         </div>
    //       </CardHeader>
    //       <CardContent className="p-3 pt-0">
    //         <Button asChild className="w-full gap-2 h-8 text-xs">
    //           <Link href="/dashboard/profile/edit">
    //             <Edit2 className="h-3 w-3" />
    //             Edit Profile
    //           </Link>
    //         </Button>
    //       </CardContent>
    //     </Card>

    //     {/* Account Information */}
    //     <Card className="md:col-span-2">
    //       <CardHeader className="py-3 px-3">
    //         <CardTitle className="text-base">Account Information</CardTitle>
    //         <CardDescription className="text-xs">
    //           Your account details and role information
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent className="space-y-3 p-3 pt-0">
    //         {/* Email */}
    //         <div className="flex items-start gap-2">
    //           <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
    //           <div className="min-w-0">
    //             <p className="text-xs font-medium text-muted-foreground">Email Address</p>
    //             <p className="text-sm font-medium truncate">{user.email}</p>
    //           </div>
    //         </div>

    //         {/* Role */}
    //         <div className="flex items-start gap-2">
    //           <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
    //           <div className="min-w-0">
    //             <p className="text-xs font-medium text-muted-foreground">Role</p>
    //             <p className="text-sm font-medium capitalize">{formatRole(user.role)}</p>
    //           </div>
    //         </div>

    //         {/* Department */}
    //         {user.department && (
    //           <div className="flex items-start gap-2">
    //             <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
    //             <div className="min-w-0">
    //               <p className="text-xs font-medium text-muted-foreground">Department</p>
    //               <p className="text-sm font-medium">{user.department}</p>
    //             </div>
    //           </div>
    //         )}

    //         {/* Status */}
    //         <div className="flex items-start gap-2">
    //           <div className="h-4 w-4 rounded-full bg-green-500 mt-0.5 flex-shrink-0" />
    //           <div className="min-w-0">
    //             <p className="text-xs font-medium text-muted-foreground">Account Status</p>
    //             <Badge variant="default" className="capitalize text-xs py-0.5 mt-1">
    //               {user.status}
    //             </Badge>
    //           </div>
    //         </div>

    //         {/* ID */}
    //         <div className="flex items-start gap-2">
    //           <div className="h-4 w-4 text-muted-foreground mt-0.5 flex items-center justify-center flex-shrink-0">
    //             <span className="text-xs">#</span>
    //           </div>
    //           <div className="min-w-0">
    //             <p className="text-xs font-medium text-muted-foreground">User ID</p>
    //             <p className="text-sm font-medium font-mono truncate">{user.id}</p>
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </div>

    //   {/* Security Section */}
    //   <Card>
    //     <CardHeader className="py-3 px-3">
    //       <CardTitle className="text-base">Security</CardTitle>
    //       <CardDescription className="text-xs">
    //         Manage your password and security settings
    //       </CardDescription>
    //     </CardHeader>
    //     <CardContent className="p-3 pt-0">
    //       <Button asChild variant="outline" className="h-8 text-xs">
    //         <Link href="/dashboard/settings#security">
    //           <span>Change Password</span>
    //         </Link>
    //       </Button>
    //     </CardContent>
    //   </Card>
    // </div>
    <div>
      Profile Page TODO
    </div>
  );
}
