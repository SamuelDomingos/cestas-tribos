"use client"

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(!open)}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-lg border bg-popover p-1 shadow-md">
          <button
            className="flex w-full items-center rounded-md px-3 py-1.5 text-xs hover:bg-accent"
            onClick={() => { setTheme("light"); setOpen(false); }}
          >
            Claro
          </button>
          <button
            className="flex w-full items-center rounded-md px-3 py-1.5 text-xs hover:bg-accent"
            onClick={() => { setTheme("dark"); setOpen(false); }}
          >
            Escuro
          </button>
          <button
            className="flex w-full items-center rounded-md px-3 py-1.5 text-xs hover:bg-accent"
            onClick={() => { setTheme("system"); setOpen(false); }}
          >
            Sistema
          </button>
        </div>
      )}
    </div>
  );
}
