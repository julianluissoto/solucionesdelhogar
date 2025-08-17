
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Datos de ejemplo para los trabajos
const sampleJobs = [
    { title: "Pintar pared exterior de casa", category: "Hogar", location: "Palermo, Buenos Aires", provincia: "Buenos Aires", description: "Necesito pintar la fachada de mi casa, son aproximadamente 80 metros cuadrados. La pintura la proveo yo.", budget: 75000, publisherName: "Lucia Fernandez" },
    { title: "Instalación de 5 tomas de corriente", category: "Hogar", location: "Caballito, Buenos Aires", provincia: "Buenos Aires", description: "Agregar 5 tomas de corriente en el living. El cableado ya está pasado.", budget: 25000, publisherName: "Marcos Gerez" },
    { title: "Reparar reja de balcón oxidada", category: "Construcción", location: "Centro, Córdoba", provincia: "Córdoba", description: "La reja del balcón tiene partes oxidadas que necesitan ser lijadas, tratadas y pintadas.", budget: 40000, publisherName: "Sofia Benitez" },
    { title: "Diseño de logo para emprendimiento", category: "Diseño Gráfico", location: "Nueva Córdoba, Córdoba", provincia: "Córdoba", description: "Busco un diseñador para crear un logo moderno para mi marca de ropa. Necesito el archivo en varios formatos.", budget: 50000, publisherName: "Martin Roldan" },
    { title: "Mantenimiento de jardín pequeño", category: "Hogar", location: "Centro, Rosario", provincia: "Santa Fe", description: "Cortar el césped y podar algunos arbustos en un jardín de 5x5 metros. Trabajo recurrente una vez al mes.", budget: 15000, publisherName: "Valentina Sosa" },
    { title: "Revisión de calefón a gas", category: "Hogar", location: "La Plata, Buenos Aires", provincia: "Buenos Aires", description: "El calefón no enciende correctamente y a veces se apaga solo. Necesito una revisión por un gasista matriculado.", budget: 20000, publisherName: "Diego Costa" },
    { title: "Soldar pata de mesa de metal", category: "Construcción", location: "Godoy Cruz, Mendoza", provincia: "Mendoza", description: "Se quebró una de las patas de una mesa de hierro. Necesito que la vuelvan a soldar para que quede firme.", budget: 18000, publisherName: "Julieta Morales" },
    { title: "Redacción de 4 artículos para blog", category: "Escritura", location: "Remoto", provincia: "Todas las provincias", description: "Necesito 4 artículos de 500 palabras cada uno sobre marketing digital. Se proveerán los temas.", budget: 30000, publisherName: "Nicolas Vazquez" },
    { title: "Paseador para perro mediano", category: "Cuidado de mascotas", location: "Belgrano, Buenos Aires", provincia: "Buenos Aires", description: "Busco paseador para mi perro, de lunes a viernes, una hora por la tarde. Es un perro muy amigable.", budget: 35000, publisherName: "Camila Gimenez" },
    { title: "Instalación de grifería de cocina", category: "Hogar", location: "San Miguel de Tucumán, Tucumán", provincia: "Tucumán", description: "Compré una nueva grifería monocomando para la cocina y necesito que la instalen.", budget: 12000, publisherName: "Lucas Castillo" },
];


export default function SeedJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirige si el usuario no está autenticado
  if (!authLoading && !user) {
    router.push('/login');
  }

  const handleSeed = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "No Autenticado",
        description: "Debes iniciar sesión para cargar los datos.",
      });
      return;
    }
    setIsLoading(true);
    let count = 0;
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const publisherPhotoURL = userDoc.exists() ? userDoc.data().photoURL : undefined;

        for (const job of sampleJobs) {
            const jobData: any = {
                ...job,
                publisherId: user.uid,
                createdAt: serverTimestamp(),
            };

            if (publisherPhotoURL) {
                jobData.publisherPhotoURL = publisherPhotoURL;
            }

            await addDoc(collection(db, "jobs"), jobData);
            count++;
            toast({ title: `Trabajo ${count}/${sampleJobs.length} cargado`, description: `Se añadió "${job.title}"` });
        }
        toast({ 
            title: "¡Éxito!", 
            description: `Se cargaron ${count} trabajos de ejemplo en la base de datos.`,
            variant: "default",
            duration: 5000 
        });

    } catch (error) {
      console.error("Error al cargar los trabajos:", error);
      toast({
        variant: "destructive",
        title: "Error al Cargar Datos",
        description: "No se pudieron cargar los trabajos de ejemplo. Revisa la consola para más detalles.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
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
            <CardTitle>Cargar Datos de Ejemplo (Trabajos)</CardTitle>
            <CardDescription>
              Haz clic en el botón para añadir 10 trabajos de ejemplo a la colección 'jobs' en Firestore.
              Asegúrate de haber iniciado sesión.
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
