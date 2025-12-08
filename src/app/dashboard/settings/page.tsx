import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Bell, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Settings Page
 * User account settings and preferences
 * Following SOLID principles - Single Responsibility
 */
export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid gap-3">
        {/* Security Settings */}
        <Card id="security">
          <CardHeader className="py-3 px-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <div>
                  <CardTitle className="text-base">Security</CardTitle>
                  <CardDescription className="text-xs">Manage your password and security options</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your password regularly</p>
              </div>
              <Button variant="outline" disabled className="h-7 text-xs">
                Coming Soon
              </Button>
            </div>
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add extra security layer</p>
              </div>
              <Badge variant="outline" className="text-xs">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">Active Sessions</p>
                <p className="text-xs text-muted-foreground">Manage login sessions</p>
              </div>
              <Button variant="outline" disabled className="h-7 text-xs">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="py-3 px-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-600" />
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription className="text-xs">Manage how you receive notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive account updates</p>
              </div>
              <Button variant="outline" disabled className="h-7 text-xs">
                Coming Soon
              </Button>
            </div>
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">Application Updates</p>
                <p className="text-xs text-muted-foreground">Get feature notifications</p>
              </div>
              <Button variant="outline" disabled className="h-7 text-xs">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader className="py-3 px-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              <div>
                <CardTitle className="text-base">Privacy</CardTitle>
                <CardDescription className="text-xs">Control your privacy and data settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">Profile Visibility</p>
                <p className="text-xs text-muted-foreground">Control who sees your profile</p>
              </div>
              <Button variant="outline" disabled className="h-7 text-xs">
                Coming Soon
              </Button>
            </div>
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">Data Export</p>
                <p className="text-xs text-muted-foreground">Download your account data</p>
              </div>
              <Button variant="outline" disabled className="h-7 text-xs">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="py-3 px-3">
            <CardTitle className="text-base text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-xs">Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0 border-red-200 dark:border-red-900">
            <div className="flex items-center justify-between py-2 border-b last:border-0 border-red-200 dark:border-red-900">
              <div>
                <p className="font-medium text-sm text-red-600 dark:text-red-400">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account</p>
              </div>
              <Button variant="destructive" disabled className="h-7 text-xs">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-3 pt-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            More settings will be available soon. Contact your administrator for immediate assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
