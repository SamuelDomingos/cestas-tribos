import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./_components/app-sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/modeToggle"
import { AddDeliveryDialog } from "./_components/add-delivery-dialog"

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="h-screen">
        <div className="flex items-center justify-between border-b px-4 py-2 md:hidden">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm font-semibold">Cestas Tribos</span>
          </div>
          <ModeToggle />
        </div>
        <ScrollArea className="h-full">
          {children}

          <div className="fixed right-6 bottom-6 z-50 md:hidden">
            <AddDeliveryDialog />
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}
