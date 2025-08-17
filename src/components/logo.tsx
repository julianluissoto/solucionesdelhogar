import { cn } from "@/lib/utils";
import Image from "next/image";

const Logo = ({ className }: { className?: string }) => (
    <Image
        src="https://res.cloudinary.com/julian-soto/image/upload/v1755466710/soluciones/logo_png_tzq6ut.png"
        alt="SolucionesSimple Logo"
        width={40}
        height={40}
        className={cn("h-8 w-8", className)}
    />
);

export default Logo;
