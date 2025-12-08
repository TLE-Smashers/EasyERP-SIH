"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { getNavigationForRole, getAlumniNavigation } from "@/config/navigation"
import { UserRole } from "@/types/auth"
import { cn } from "@/lib/utils"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    role: UserRole
    department?: string
  }
}

// Helper function to determine if a navigation item is active
function isItemActive(item: any, pathname: string): boolean {
  // If item has a direct URL match
  if (item.url !== "#" && pathname === item.url) {
    return true
  }

  // If item has sub-items, check if any sub-item matches
  if (item.items && item.items.length > 0) {
    return item.items.some((subItem: any) => pathname === subItem.url || pathname.startsWith(subItem.url + "/"))
  }

  // For items with "#" URL, check if pathname starts with the base path
  if (item.url === "#") {
    const basePath = item.items?.[0]?.url?.split("/").slice(0, -1).join("/") || ""
    return pathname.startsWith(basePath)
  }

  return false
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  // Check if the current path is alumni dashboard
  const isAlumniPath = pathname.startsWith('/dashboard/alumni')

  // Get navigation items based on user role or alumni status
  const navItems = React.useMemo(() => {
    if (!user) return []
    // If user is on alumni path and is a student, show alumni navigation
    if (isAlumniPath && user.role === 'student') {
      return getAlumniNavigation()
    }
    return getNavigationForRole(user.role)
  }, [user, isAlumniPath])

  // Determine active navigation items based on current pathname
  const activeNavItems = React.useMemo(() => {
    return navItems.map(item => ({
      ...item,
      isActive: isItemActive(item, pathname),
      items: item.items?.map(subItem => ({
        ...subItem,
        isActive: pathname === subItem.url
      }))
    }))
  }, [navItems, pathname])

  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Debug logging
  console.log('Sidebar - User role:', user?.role);
  console.log('Sidebar - Nav items count:', navItems.length);

  // Default user data if not provided
  const userData = user || {
    name: "Guest User",
    email: "guest@example.com",
    avatar: "",
  }

  const teamData = {
    name: "Easy ERP",
    logo: "/logoEasyErp.png",
    plan: user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Guest",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-2">
        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed && "justify-center"
          )}
        >
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <TeamSwitcher teams={[teamData]} />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="group h-8 w-8 shrink-0 border border-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
            title={isCollapsed ? "Open sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <Image
                  src="/logoEasyErp.png"
                  alt="Easy ERP"
                  width={20}
                  height={20}
                  className="h-5 w-5 transition-opacity duration-200 group-hover:opacity-0"
                />
                <SplitViewIcon className="absolute h-4 w-4 text-sidebar-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>
            ) : (
              <SplitViewIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={activeNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData as any} />
      </SidebarFooter>
    </Sidebar>
  )
}

function SplitViewIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x={4} y={5} width={16} height={14} rx={3} />
      <path d="M12 5v14" />
    </svg>
  )
}
