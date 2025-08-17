"use client";

import { Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
    title: string;
    text: string;
    url: string;
    buttonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    buttonClassName?: string;
}

export default function SpecificShareButton({ title, text, url, buttonVariant = "ghost", buttonClassName }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    const shareData = {
        title: title,
        text: text,
        url: url,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error al compartir:", error);
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(url);
        toast({
            title: "Enlace copiado",
            description: "No se pudo abrir el diálogo para compartir, pero el enlace se ha copiado.",
        });
      }
    } else {
        navigator.clipboard.writeText(url);
        toast({
            title: "Enlace copiado",
            description: "El enlace se ha copiado a tu portapapeles.",
        });
    }
  };

  return (
    <Button variant={buttonVariant} onClick={handleShare} className={buttonClassName}>
        <Share2 className="mr-2 h-4 w-4" />
        Compartir
    </Button>
  );
}
