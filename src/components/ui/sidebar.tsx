
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { defaultOpen?: boolean }
>(({ defaultOpen = true, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(isMobile ? false : defaultOpen)

  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])
  
  React.useEffect(() => {
    if (isMobile) setOpen(false);
    else setOpen(defaultOpen);
  }, [isMobile, defaultOpen])

  const contextValue = React.useMemo<SidebarContext>(
    () => ({ open, setOpen, isMobile, toggleSidebar }),
    [open, setOpen, isMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div ref={ref} className={cn("group/sidebar flex min-h-svh w-full", props.className)} {...props}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"


const Sidebar = React.forwardRef<HTMLElement, React.ComponentProps<"aside">>(({ className, children, ...props }, ref) => {
    const { open, isMobile, setOpen } = useSidebar()

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground flex flex-col">
                    {children}
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <aside
            ref={ref}
            className={cn(
                "hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out flex-shrink-0",
                open ? "w-64" : "w-20",
                className
            )}
            {...props}
        >
            {children}
        </aside>
    )
})
Sidebar.displayName = "Sidebar"


const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", className)}
        onClick={(event) => {
          onClick?.(event)
          toggleSidebar()
        }}
        {...props}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(
  ({ className, ...props }, ref) => {
    return (
      <main ref={ref} className={cn("flex-1", className)} {...props} />
    )
  }
)
SidebarInset.displayName = "SidebarInset"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    const { open } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-4 border-b border-sidebar-border", open ? "justify-between" : "justify-center", className)}
        {...props}
      />
    )
  }
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 overflow-y-auto", className)}
        {...props}
      />
    )
  }
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 border-t border-sidebar-border", className)}
        {...props}
      />
    )
  }
)
SidebarFooter.displayName = "SidebarFooter"


const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-col gap-1 p-2", className)} {...props} />
  )
)
SidebarMenu.displayName = "SidebarMenu"


const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("relative", className)} {...props} />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"


const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm font-medium outline-none transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      isActive: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground",
        false: "text-sidebar-foreground",
      }
    },
    defaultVariants: {
      isActive: false
    }
  }
)

const SidebarMenuButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button> & {
    isActive?: boolean
    tooltip?: React.ComponentProps<typeof TooltipContent>
  }
>(({ asChild, isActive, tooltip, className, children, ...props }, ref) => {
  const { open } = useSidebar()

  const buttonContent = (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(sidebarMenuButtonVariants({isActive}), open ? "" : "w-12 justify-center", className)}
      {...props}
    >
      {children}
    </Button>
  )

  if (open || !tooltip) {
    return buttonContent
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
      <TooltipContent {...tooltip}>{tooltip.children}</TooltipContent>
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      className={cn("my-2 bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"


// Dummy components to satisfy existing API, will not be used in the simplified version
const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
    <hr ref={ref as React.RefObject<HTMLHRElement>} className={cn("border-t border-border", props.className)} />
));
Separator.displayName = "Separator";

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
}
// Add empty exports for unused components to avoid breaking imports
export const SidebarRail = () => null;
export const SidebarInput = () => null;
export const SidebarGroup = React.forwardRef<HTMLDivElement, any>(({children, ...props}, ref) => <div ref={ref} {...props}>{children}</div>);
SidebarGroup.displayName = "SidebarGroup";
export const SidebarGroupLabel = () => null;
export const SidebarGroupAction = () => null;
export const SidebarGroupContent = () => null;
export const SidebarMenuAction = () => null;
export const SidebarMenuBadge = () => null;
export const SidebarMenuSkeleton = () => null;
export const SidebarMenuSub = () => null;
export const SidebarMenuSubItem = () => null;
export const SidebarMenuSubButton = () => null;
