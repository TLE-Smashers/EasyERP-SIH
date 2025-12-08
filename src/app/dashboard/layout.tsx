import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardBreadcrumb } from "@/components/DashboardBreadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <SidebarProvider suppressHydrationWarning>
      <AppSidebar user={user as any} suppressHydrationWarning />
      <SidebarInset className="overflow-x-hidden" suppressHydrationWarning>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between border-b border-border bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <DashboardBreadcrumb />
          </div>
          <div className="flex items-center gap-3 px-4">
            <ModeToggle />
            <Separator
              orientation="vertical"
              className="hidden md:block h-6"
            />
            <LogoutButton className="hidden md:inline-flex" />
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-x-hidden px-4 md:px-6 lg:px-8 pt-2 pb-4 md:pt-3 md:pb-6 lg:pt-4 lg:pb-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>

  );
}
