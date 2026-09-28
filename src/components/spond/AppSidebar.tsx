"use client";

import * as React from "react";
import {
  ChevronsUpDownIcon,
  CircleHelpIcon,
  LayoutDashboardIcon,
  UsersRoundIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/spond/NavUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { SpondGroup, SpondProfile } from "@/lib/spond/types";

const navMain = [
  {
    title: "Oversikt",
    url: "#",
    icon: <LayoutDashboardIcon />,
    isActive: true,
  },
];

const navSecondary = [
  {
    title: "Spond hjelpesenter",
    url: "https://help.spond.com",
    icon: <CircleHelpIcon />,
  },
];

export function AppSidebar({
  groups,
  groupId,
  onGroupChange,
  profile,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  groups: SpondGroup[];
  groupId: string;
  onGroupChange: (groupId: string) => void;
  profile: SpondProfile | null;
}) {
  const selectedGroup = groups.find((g) => g.id === groupId) ?? groups[0];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[slot=sidebar-menu-button]:p-1.5!"
                  />
                }
              >
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <UsersRoundIcon className="size-4" />
                </div>
                <span className="truncate text-base font-semibold">
                  {selectedGroup?.name ?? "Spond"}
                </span>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {groups.map((g) => (
                  <DropdownMenuItem
                    key={g.id}
                    onClick={() => onGroupChange(g.id)}
                  >
                    {g.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser profile={profile} />
      </SidebarFooter>
    </Sidebar>
  );
}
