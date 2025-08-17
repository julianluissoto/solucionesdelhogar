import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M43.44 22.014L22.015 43.439a6.25 6.25 0 000 8.839l14.16 14.16a6.25 6.25 0 008.84 0l21.424-21.425a18.75 18.75 0 00-22.999-22.999z"
        stroke="hsl(var(--primary))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M34.996 58.053l-5.664 5.664a6.25 6.25 0 00-1.756 7.02l-1.89 6.613a2.5 2.5 0 003.044 3.044l6.613-1.89a6.25 6.25 0 007.02-1.756l5.664-5.664"
        stroke="hsl(var(--primary))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
       <path
        d="M65 25L75 35"
        stroke="hsl(var(--primary))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
);

export default Logo;
