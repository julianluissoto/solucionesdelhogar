
"use client";

import Link from "next/link";
import { Menu, LogOut, UserCircle, Briefcase, User } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import ShareButton from "./share-button";
import { useAuth } from "@/contexts/auth-context";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import Logo from "./logo";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPhotoURL(docSnap.data().photoURL || "");
        }
      }
    };
    fetchUserPhoto();
  }, [user]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center bg-card border-b">
      <Link href="/" className="flex items-center justify-center">
        <Logo className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-bold">SolucionSimple</span>
      </Link>
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
        <Button variant="ghost" asChild>
          <Link
            href="/trabajos"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Trabajos
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link
            href="/trabajadores"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Trabajadores
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link
            href="/trabajos/nuevo"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Crear Trabajo
          </Link>
        </Button>
        <ShareButton />
        {loading ? (
          <div className="w-24 h-8 bg-muted rounded-md animate-pulse" />
        ) : user ? (
          <>
            <Button variant="ghost" asChild>
              <Link href="/profile" className="text-sm font-medium flex items-center gap-2">
                 <Avatar className="h-7 w-7">
                    <AvatarImage src={photoURL} />
                    <AvatarFallback><UserCircle className="h-full w-full"/></AvatarFallback>
                </Avatar>
                Mi Perfil
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/login" className="text-sm font-medium">
              Iniciar Sesión / Registrarse
            </Link>
          </Button>
        )}
      </nav>
      <div className="ml-auto md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú de navegación</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Navegación</SheetTitle>
              <SheetDescription>Selecciona una página para navegar.</SheetDescription>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium mt-6">
              <Link href="/trabajos" className="flex items-center gap-3 hover:text-primary">
                <Briefcase className="h-5 w-5" />
                Trabajos
              </Link>
               <Link href="/trabajadores" className="flex items-center gap-3 hover:text-primary">
                <User className="h-5 w-5" />
                Trabajadores
              </Link>
              <Link href="/trabajos/nuevo" className="hover:text-primary">
                Crear Trabajo
              </Link>
              <div className="flex">
                <ShareButton />
              </div>
               {loading ? (
                  <div className="w-full h-8 bg-muted rounded-md animate-pulse" />
                ) : user ? (
                  <>
                     <Link href="/profile" className="flex items-center gap-3 hover:text-primary">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={photoURL} />
                            <AvatarFallback><UserCircle className="h-full w-full"/></AvatarFallback>
                        </Avatar>
                        Mi Perfil
                    </Link>
                    <Button variant="ghost" onClick={handleLogout} className="justify-start p-0 h-auto text-lg hover:text-primary">
                       Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Link href="/login" className="hover:text-primary">
                    Iniciar Sesión / Registrarse
                  </Link>
               )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
