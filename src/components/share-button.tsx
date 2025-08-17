"use client";

import { Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ShareButton() {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
        title: "SolucionSimple",
        text: "Encuentra Ayuda, Ofrece tu Talento. Simple.",
        url: window.location.origin,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error al compartir:", error);
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(window.location.origin);
        toast({
            title: "Enlace copiado",
            description: "No se pudo abrir el diálogo para compartir, pero el enlace se ha copiado.",
        });
      }
    } else {
        navigator.clipboard.writeText(window.location.origin);
        toast({
            title: "Enlace copiado",
            description: "El enlace a la página principal se ha copiado a tu portapapeles.",
        });
    }
  };

  return (
    <Button variant="ghost" onClick={handleShare} className="text-sm font-medium hover:underline underline-offset-4">
        <Share2 className="mr-2 h-4 w-4" />
        Compartir
    </Button>
  );
}
