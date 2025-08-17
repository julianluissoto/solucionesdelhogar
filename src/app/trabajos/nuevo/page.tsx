
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const predefinedCategories = [
    "Diseño Gráfico",
    "Hogar",
    "Escritura",
    "Cuidado de mascotas",
    "Construcción",
    "Programación",
];

interface UserData {
    firstName?: string;
    lastName?: string;
    photoURL?: string;
}

interface Provincia {
    id: string;
    nombre: string;
}

interface Localidad {
    id: string;
    nombre: string;
}


export default function NewJobPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [provincia, setProvincia] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [publisherPhotoURL, setPublisherPhotoURL] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [isLocalidadesLoading, setIsLocalidadesLoading] = useState(false);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
        const fetchUserData = async () => {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data() as UserData;
                setPublisherName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim());
                setPublisherPhotoURL(userData.photoURL);
            }
        };
        fetchUserData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProvincias = async () => {
        try {
            const response = await fetch('https://apis.datos.gob.ar/georef/api/provincias?orden=nombre');
            const data = await response.json();
            setProvincias(data.provincias);
        } catch (error) {
            console.error("Error fetching provincias:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las provincias." });
        }
    };
    fetchProvincias();
  }, [toast]);

  useEffect(() => {
    if (provincia) {
        const fetchLocalidades = async () => {
            setIsLocalidadesLoading(true);
            setLocalidades([]);
            try {
                const response = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${provincia}&campos=id,nombre&max=5000&orden=nombre`);
                const data = await response.json();
                setLocalidades(data.localidades);
            } catch (error) {
                console.error("Error fetching localidades:", error);
                toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las localidades." });
            } finally {
                setIsLocalidadesLoading(false);
            }
        };
        fetchLocalidades();
    }
  }, [provincia, toast]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "No Autenticado",
        description: "Debes iniciar sesión para publicar un trabajo.",
      });
      router.push("/login");
      return;
    }
    
    let rawCategory = category === 'otro' ? otherCategory : category;
    const finalCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
    
    const selectedProvincia = provincias.find(p => p.nombre === provincia)?.nombre;

    if (!title || !finalCategory || !selectedProvincia || !localidad || !description || !budget || !publisherName) {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, completa todos los campos requeridos.",
        });
        return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "jobs"), {
        title,
        category: finalCategory,
        location: `${localidad}, ${selectedProvincia}`,
        provincia: selectedProvincia,
        description,
        budget: Number(budget),
        publisherName,
        publisherId: user.uid,
        publisherPhotoURL: publisherPhotoURL,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "¡Trabajo Publicado!",
        description: "Tu oferta de trabajo ha sido publicada con éxito.",
      });
      router.push("/trabajos");
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error al Publicar",
        description: "No se pudo publicar el trabajo. Inténtalo de nuevo.",
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
            <div className="container">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Cargando...</p>
              </div>
            </div>
          </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
        <div className="container">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Crear un nuevo trabajo</CardTitle>
            <CardDescription>
              Describe lo que necesitas para encontrar a la persona adecuada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Título del Trabajo</Label>
                <Input id="title" placeholder="Ej: Necesito un diseñador para un logo" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {predefinedCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <SelectItem value="otro">Otro (Especificar)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              {category === 'otro' && (
                <div className="space-y-2">
                    <Label htmlFor="other-category">Nombre de la nueva categoría</Label>
                    <Input id="other-category" placeholder="Ej: Redacción de Contenidos" value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} required />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Select value={provincia} onValueChange={setProvincia} required>
                      <SelectTrigger id="provincia">
                          <SelectValue placeholder="Selecciona una provincia" />
                      </SelectTrigger>
                      <SelectContent>
                          {provincias.map(p => (
                            <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localidad">Localidad / Ciudad</Label>
                  <Select value={localidad} onValueChange={setLocalidad} required disabled={!provincia || isLocalidadesLoading}>
                      <SelectTrigger id="localidad">
                          <SelectValue placeholder={isLocalidadesLoading ? "Cargando..." : "Selecciona una localidad"} />
                      </SelectTrigger>
                      <SelectContent>
                          {localidades.map(l => (
                            <SelectItem key={l.id} value={l.nombre}>{l.nombre}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="Describe detalladamente lo que necesitas, los requisitos, etc." value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Presupuesto (ARS)</Label>
                <Input id="budget" type="number" placeholder="Ej: 50000" value={budget} onChange={(e) => setBudget(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Tu Nombre</Label>
                <Input id="publisher" placeholder="Ej: Juan Pérez" value={publisherName} onChange={(e) => setPublisherName(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="animate-spin mr-2" /> Publicando...</> : "Publicar Trabajo"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}

    