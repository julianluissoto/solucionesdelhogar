
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.788,44,30.338,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);


    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Las contraseñas no coinciden",
                description: "Por favor, verifica que ambas contraseñas sean iguales.",
            });
            return;
        }

        if (!role) {
            toast({
                variant: "destructive",
                title: "Error de Validación",
                description: "Por favor, selecciona un rol (Trabajador o Empleador).",
            });
            return;
        }
        if (role === 'trabajador' && !category) {
            toast({
                variant: "destructive",
                title: "Error de Validación",
                description: "Por favor, selecciona una categoría si eres trabajador.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userData: { [key: string]: any } = {
                uid: user.uid,
                firstName,
                lastName,
                email,
                role,
            };

            if (role === 'trabajador') {
                userData.category = category;
            }

            await setDoc(doc(db, "users", user.uid), userData);
            
            toast({ title: "¡Cuenta Creada!", description: "Tu cuenta ha sido creada con éxito." });
            router.push('/trabajos');
        } catch (error: any) {
            console.error("Error signing up:", error);
            let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
            if (error.code === 'auth/email-already-in-use') {
                description = "Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión o utiliza otro correo.";
            } else if (error.code === 'auth/weak-password') {
                description = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
            }
            toast({
                variant: "destructive",
                title: "Error al Registrarse",
                description: description,
            });
        } finally {
            setIsLoading(false);
        }
    }
    
     const handleGoogleSignup = async () => {
        if (!role) {
            toast({
                variant: "destructive",
                title: "Selecciona un Rol",
                description: "Por favor, elige si eres 'Trabajador' o 'Empleador' antes de registrarte con Google.",
            });
            return;
        }
        if (role === 'trabajador' && !category) {
            toast({
                variant: "destructive",
                title: "Selecciona una Categoría",
                description: "Como trabajador, debes seleccionar tu categoría principal.",
            });
            return;
        }
        
        setIsGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // User already exists, just log them in
                 toast({ title: "¡Bienvenido de nuevo!", description: "Has iniciado sesión con éxito." });
            } else {
                // New user, create a document with the selected role
                const [firstName, ...lastNameParts] = user.displayName?.split(" ") || ["", ""];
                const lastName = lastNameParts.join(" ");
                
                const userData: { [key: string]: any } = {
                    uid: user.uid,
                    firstName: firstName,
                    lastName: lastName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: role, // Use the selected role
                };

                if (role === 'trabajador') {
                    userData.category = category;
                }
                
                await setDoc(docRef, userData);
                toast({ title: "¡Cuenta Creada!", description: "Bienvenido a SolucionSimple. Puedes completar tu perfil." });
            }

            router.push('/trabajos');

        } catch (error: any) {
             console.error("Error con el registro de Google:", error);
             toast({
                variant: "destructive",
                title: "Error de Google",
                description: "No se pudo registrar con Google. Inténtalo de nuevo.",
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
            <CardTitle className="text-2xl font-bold font-headline">Crear una Cuenta</CardTitle>
            <CardDescription>Únete a SolucionSimple hoy.</CardDescription>
        </CardHeader>
        <CardContent>
            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Nombre</Label>
                  <Input id="first-name" placeholder="Max" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isGoogleLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Apellido</Label>
                  <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isGoogleLoading}/>
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isGoogleLoading}/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isGoogleLoading}/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isGoogleLoading}/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="role">Soy un</Label>
                <Select required value={role} onValueChange={setRole} disabled={isGoogleLoading}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="trabajador">Trabajador</SelectItem>
                        <SelectItem value="empleador">Empleador</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              {role === 'trabajador' && (
                <div className="space-y-2">
                    <Label htmlFor="category">Categoría Principal</Label>
                     <Select required value={category} onValueChange={setCategory} disabled={isGoogleLoading}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Selecciona tu especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Diseño Gráfico">Diseño Gráfico</SelectItem>
                            <SelectItem value="Hogar">Hogar</SelectItem>
                            <SelectItem value="Escritura">Escritura</SelectItem>
                            <SelectItem value="Cuidado de mascotas">Cuidado de mascotas</SelectItem>
                            <SelectItem value="Construcción">Construcción</SelectItem>
                            <SelectItem value="Programación">Programación</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? "Creando Cuenta..." : "Crear Cuenta"}
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
             <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={isLoading || isGoogleLoading}>
                 {isGoogleLoading ? "Cargando..." : <><GoogleIcon className="mr-2 h-5 w-5" /> Google</>}
            </Button>
            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="underline">
                Inicia Sesión
              </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}
