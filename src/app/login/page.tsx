
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.788,44,30.338,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: "¡Bienvenido!", description: "Has iniciado sesión con éxito." });
            router.push('/trabajos');
        } catch (error: any) {
            console.error("Error signing in:", error);
            toast({
                variant: "destructive",
                title: "Error al Iniciar Sesión",
                description: "Las credenciales son incorrectas. Por favor, inténtalo de nuevo.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                 const [firstName, ...lastNameParts] = user.displayName?.split(" ") || ["", ""];
                 const lastName = lastNameParts.join(" ");
                // If user doesn't exist, create a new document.
                await setDoc(docRef, {
                    uid: user.uid,
                    firstName: firstName,
                    lastName: lastName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: 'empleador', // Default role, user can change later in profile
                });
                 toast({ title: "¡Cuenta Creada!", description: "Bienvenido a SolucionSimple." });
            } else {
                toast({ title: "¡Bienvenido de nuevo!", description: "Has iniciado sesión con éxito." });
            }

            router.push('/trabajos');

        } catch (error: any) {
             console.error("Error con el inicio de sesión de Google:", error);
             toast({
                variant: "destructive",
                title: "Error de Google",
                description: "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
       <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-1 text-center">
            <div className="inline-block bg-primary/10 p-3 rounded-full mx-auto">
                 <Logo className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-headline">Bienvenido de Nuevo</CardTitle>
            <CardDescription>Inicia sesión en tu cuenta de SolucionSimple</CardDescription>
        </CardHeader>
        <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isGoogleLoading}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isGoogleLoading}/>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
            </form>
             <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
                {isGoogleLoading ? "Cargando..." : <><GoogleIcon className="mr-2 h-5 w-5" /> Google</>}
            </Button>
            <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="underline">
                Regístrate
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}
