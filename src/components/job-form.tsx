

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


const predefinedCategories = [
    "Diseño Gráfico",
    "Hogar",
    "Escritura",
    "Cuidado de mascotas",
    "Construcción",
    "Programación",
];

interface JobData {
    title: string;
    category: string;
    location: string;
    description: string;
    budget: number;
    createdAt?: Timestamp;
    publisherId: string; // Added for edit validation
    id?: string;
}

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

interface JobFormProps {
    jobId?: string;
}

export function JobForm({ jobId }: JobFormProps) {
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
  const [isFetchingData, setIsFetchingData] = useState(true);

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [isLocalidadesLoading, setIsLocalidadesLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchInitialData = async () => {
        setIsFetchingData(true);
        // Fetch user data
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data() as UserData;
                setPublisherName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim());
                setPublisherPhotoURL(userData.photoURL);
            }
        }

        // Fetch provincias
        try {
            const response = await fetch('https://apis.datos.gob.ar/georef/api/provincias?orden=nombre');
            const data = await response.json();
            setProvincias(data.provincias);
        } catch (error) {
            console.error("Error fetching provincias:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las provincias." });
        }
        
        // If editing, fetch job data
        if (jobId) {
            const jobDocRef = doc(db, "jobs", jobId);
            const jobDocSnap = await getDoc(jobDocRef);
            if (jobDocSnap.exists()) {
                const jobData = jobDocSnap.data() as JobData;
                if (jobData.publisherId !== user?.uid) {
                    toast({ variant: "destructive", title: "No autorizado", description: "No tienes permiso para editar este trabajo." });
                    router.push("/mis-trabajos");
                    return;
                }
                setTitle(jobData.title);
                const isPredefined = predefinedCategories.includes(jobData.category);
                setCategory(isPredefined ? jobData.category : "otro");
                if (!isPredefined) {
                    setOtherCategory(jobData.category);
                }
                setDescription(jobData.description);
                setBudget(String(jobData.budget));
                
                const [loc, prov] = jobData.location.split(',').map(s => s.trim());
                 if (prov) {
                    setProvincia(prov);
                    // Fetch localities for the province
                    setIsLocalidadesLoading(true);
                    try {
                        const response = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${prov}&campos=id,nombre&max=5000&orden=nombre`);
                        const data = await response.json();
                        setLocalidades(data.localidades);
                        setLocalidad(loc);
                    } catch (error) {
                        console.error("Error fetching localidades:", error);
                    } finally {
                        setIsLocalidadesLoading(false);
                    }
                }
            } else {
                toast({ variant: "destructive", title: "No encontrado", description: "El trabajo que intentas editar no existe." });
                router.push("/mis-trabajos");
                return;
            }
        }
        setIsFetchingData(false);
    };

    if (!authLoading) {
        fetchInitialData();
    }
}, [user, authLoading, router, jobId, toast]);


  useEffect(() => {
    if (provincia && (!jobId || (jobId && !isFetchingData))) { // Prevent re-fetching on initial load for edit
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
  }, [provincia, jobId, isFetchingData, toast]);


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

    const jobData = {
        title,
        category: finalCategory,
        location: `${localidad}, ${selectedProvincia}`,
        provincia: selectedProvincia,
        description,
        budget: Number(budget),
        publisherName,
        publisherId: user.uid,
        publisherPhotoURL: publisherPhotoURL,
    }

    try {
        if(jobId) {
            // Update existing job
            const jobRef = doc(db, "jobs", jobId);
            await updateDoc(jobRef, jobData);
            toast({ title: "¡Trabajo Actualizado!", description: "Tu oferta de trabajo ha sido actualizada." });
            router.push("/mis-trabajos");
        } else {
            // Create new job
            await addDoc(collection(db, "jobs"), {
                ...jobData,
                createdAt: serverTimestamp(),
            });
            toast({ title: "¡Trabajo Publicado!", description: "Tu oferta de trabajo ha sido publicada con éxito." });
            router.push("/trabajos");
        }
    } catch (error) {
      console.error("Error guardando el trabajo:", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo guardar el trabajo. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    if (authLoading || isFetchingData) {
    return (
        <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Cargando formulario...</p>
        </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
        <CardTitle>{jobId ? "Editar Trabajo" : "Crear un nuevo trabajo"}</CardTitle>
        <CardDescription>
            {jobId ? "Modifica los detalles de tu publicación." : "Describe lo que necesitas para encontrar a la persona adecuada."}
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
                <Select value={provincia} onValueChange={(val) => { setProvincia(val); setLocalidad(''); }} required>
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
            {isLoading ? <><Loader2 className="animate-spin mr-2" /> {jobId ? "Guardando..." : "Publicando..."}</> : (jobId ? "Guardar Cambios" : "Publicar Trabajo")}
            </Button>
        </form>
        </CardContent>
    </Card>
  );
}
