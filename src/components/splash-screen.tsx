"use client";

import Image from "next/image";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50 animate-fade-in">
      <div className="animate-pulse">
        <Image
          src="https://res.cloudinary.com/julian-soto/image/upload/v1755467480/soluciones/logo_grande_png_dc7ngq.png"
          width={600}
          height={400}
          alt="Soluciones Simples Logo"
          priority
        />
      </div>
    </div>
  );
}
