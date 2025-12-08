"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { NoticesBadge } from "@/components/notices/NoticesBadge"
import { FacultyNoticesBadge } from "@/components/notices/FacultyNoticesBadge"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    isSettings?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {
  // Separate module items from settings items
  const moduleItems = items.filter(item => !item.isSettings)
  const settingsItems = items.filter(item => item.isSettings)
  const pathname = usePathname()
  
  // Determine if we're in faculty or student context
  const isFacultyContext = pathname?.includes('/faculty')
  const isStudentContext = pathname?.includes('/student')

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Modules</SidebarGroupLabel>
        <SidebarMenu>
          {moduleItems.map((item) => {
            // Render as direct link if no items array
            if (!item.items || item.items.length === 0) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link href={item.url} className="flex items-center gap-2">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.title === "Notices" && isStudentContext && <NoticesBadge />}
                      {item.title === "Notices" && isFacultyContext && <FacultyNoticesBadge />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }
            
            // Render as collapsible dropdown if has items
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
                suppressHydrationWarning
              >
                <SidebarMenuItem suppressHydrationWarning>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent suppressHydrationWarning>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                            <Link href={subItem.url} className="flex items-center">
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>
      
      {settingsItems.length > 0 && (
        <>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarMenu>
              {settingsItems.map((item) => {
                // Render as direct link if no items array
                if (!item.items || item.items.length === 0) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                        <Link href={item.url} className="flex items-center gap-2">
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }
                
                // Render as collapsible dropdown if has items
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className="group/collapsible"
                    suppressHydrationWarning
                  >
                    <SidebarMenuItem suppressHydrationWarning>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent suppressHydrationWarning>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url} className="flex items-center">
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </>
      )}
    </>
  )
}
