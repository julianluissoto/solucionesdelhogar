
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, writeBatch, serverTimestamp, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// --- Datos de Ejemplo ---

const sampleJobs = [
    { title: "Pintar pared exterior de casa", category: "Hogar", location: "Palermo, Buenos Aires", provincia: "Buenos Aires", description: "Necesito pintar la fachada de mi casa, son aproximadamente 80 metros cuadrados. La pintura la proveo yo.", budget: 75000 },
    { title: "Instalación de 5 tomas de corriente", category: "Hogar", location: "Caballito, Buenos Aires", provincia: "Buenos Aires", description: "Agregar 5 tomas de corriente en el living. El cableado ya está pasado.", budget: 25000 },
    { title: "Reparar reja de balcón oxidada", category: "Construcción", location: "Centro, Córdoba", provincia: "Córdoba", description: "La reja del balcón tiene partes oxidadas que necesitan ser lijadas, tratadas y pintadas.", budget: 40000 },
    { title: "Diseño de logo para emprendimiento", category: "Diseño Gráfico", location: "Nueva Córdoba, Córdoba", provincia: "Córdoba", description: "Busco un diseñador para crear un logo moderno para mi marca de ropa.", budget: 50000 },
    { title: "Mantenimiento de jardín pequeño", category: "Hogar", location: "Centro, Rosario", provincia: "Santa Fe", description: "Cortar el césped y podar algunos arbustos en un jardín de 5x5 metros.", budget: 15000 },
];


export default function SeedDataPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
        if (user) {
            const adminDocRef = doc(db, "admins", user.uid);
            const adminDocSnap = await getDoc(adminDocRef);
            setIsAdmin(adminDocSnap.exists());
        }
        setCheckingAdmin(false);
    };

    if (!authLoading) {
        checkAdminStatus();
    }
  }, [user, authLoading]);


  if (!authLoading && !user) {
    router.push('/login');
  }

  const handleSeed = async () => {
    if (!user || !isAdmin) {
      toast({
        variant: "destructive",
        title: "No Autorizado",
        description: "Solo los administradores pueden ejecutar esta acción.",
      });
      return;
    }
    setIsLoading(true);
    
    try {
        const batch = writeBatch(db);

        // NOTE: Specialist data is now managed through the user profile page
        // No longer seeding specialists here to ensure specialists are real, registered users.

        // Add jobs
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const publisherName = userDoc.exists() ? `${userDoc.data().firstName} ${userDoc.data().lastName}` : "Admin";
        const publisherPhotoURL = userDoc.exists() ? userDoc.data().photoURL : undefined;

        sampleJobs.forEach(job => {
            const jobRef = doc(collection(db, "jobs")); // Create a new doc with a random ID
            const jobData: any = {
                ...job,
                publisherId: user.uid,
                publisherName: publisherName,
                createdAt: serverTimestamp(),
            };

            if (publisherPhotoURL) {
                jobData.publisherPhotoURL = publisherPhotoURL;
            }

            batch.set(jobRef, jobData);
        });

        await batch.commit();

        toast({ 
            title: "¡Éxito!", 
            description: `Se cargaron ${sampleJobs.length} trabajos. Los especialistas se gestionan desde los perfiles de usuario.`,
            variant: "default",
            duration: 5000 
        });

    } catch (error) {
      console.error("Error al cargar los datos:", error);
      toast({
        variant: "destructive",
        title: "Error al Cargar Datos",
        description: "No se pudieron cargar los datos de ejemplo. Revisa la consola para más detalles.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || checkingAdmin) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </main>
        </div>
    );
  }

  if (!isAdmin) {
     return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="flex-grow flex items-center justify-center">
                <Card className="w-full max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle>Acceso Denegado</CardTitle>
                        <CardDescription>
                         Esta página es solo para administradores.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Cargar Datos de Ejemplo (Admin)</CardTitle>
            <CardDescription>
              Este botón cargará los trabajos de ejemplo en Firestore.
              Los especialistas ahora se gestionan directamente desde sus perfiles de usuario después de registrarse.
              Esta acción solo debe ser ejecutada por un administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeed} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Cargando Datos...
                </>
              ) : (
                "Cargar Trabajos de Ejemplo"
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">
                Una vez que los datos estén cargados, puedes eliminar la carpeta /admin de tu proyecto.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
