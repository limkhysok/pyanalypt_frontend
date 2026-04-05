import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * PyAnalypt Logo - Standard SVG container for branding consistency.
 */
export function Logo({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("relative overflow-hidden rounded-full w-8 h-8", className)}>
       <Image 
          src="/logo.svg" 
          alt="PyAnalypt Logo" 
          width={512} 
          height={512} 
          className="w-full h-full object-contain"
          priority 
       />
    </div>
  );
}
