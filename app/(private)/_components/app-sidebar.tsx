"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Home, Target, Users, SunMoon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AddDeliveryDialog } from "./add-delivery-dialog"
import { ModeToggle } from "@/components/modeToggle"

const TRIBE_IMAGES: Record<string, string> = {
  hope: "/tribos/hope.jpeg",
  hazak: "/tribos/hazak.jpeg",
  sent: "/tribos/sent.jpeg",
}

const TRIBE_NAMES: Record<string, string> = {
  hope: "Hope",
  hazak: "Hazak",
  sent: "Sent",
}

const mainLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/metas", label: "Metas", icon: Target },
]

const adminLinks = [
  { href: "/usuarios", label: "Usuários", icon: Users },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [userData, setUserData] = useState({
    name: "—",
    initials: "?",
    tribe: "",
    role: "user",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((res: any) => {
      const meta = res.data?.user?.user_metadata || {}
      const name = meta.full_name || res.data?.user?.email || "—"
      const tribe = meta.tribe || ""
      const role = meta.role || "user"
      setUserData({
        name,
        initials: name.slice(0, 2).toUpperCase(),
        tribe,
        role,
      })
    })
  }, [])

  const tribeImg = TRIBE_IMAGES[userData.tribe]
  const tribeName = TRIBE_NAMES[userData.tribe] || userData.tribe || "Sem tribo"

  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 pt-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:px-0">
          <Avatar size="lg">
            <AvatarImage src={tribeImg} alt={tribeName} />
            <AvatarFallback>{userData.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">{userData.name}</span>
            <span className="text-xs text-muted-foreground">{tribeName}</span>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={pathname === href}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userData.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminLinks.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={pathname.startsWith(href)}
                      tooltip={label}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <Separator />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <AddDeliveryDialog />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <div className="mt-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tema</span>
            <ModeToggle />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
