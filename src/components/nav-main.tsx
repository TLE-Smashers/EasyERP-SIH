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
          <SidebarSeparator className="my-4" />
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              System
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item) => {
                // Render as direct link if no items array
                if (!item.items || item.items.length === 0) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.title} 
                        isActive={item.isActive}
                        className="rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-slate-600 data-[active=true]:to-slate-700 data-[active=true]:text-white transition-all duration-300"
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span className="font-medium">{item.title}</span>
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
                        <SidebarMenuButton 
                          tooltip={item.title}
                          className="rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 transition-all duration-300"
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span className="font-medium">{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent suppressHydrationWarning>
                        <SidebarMenuSub className="ml-4 space-y-1">
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild
                                className="rounded-lg hover:bg-slate-50 transition-all duration-200"
                              >
                                <Link href={subItem.url} className="flex items-center">
                                  <span className="text-sm">{subItem.title}</span>
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
