
"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, UserCircle, FileText, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

interface Provincia {
    id: string;
    nombre: string;
}

interface Localidad {
    id: string;
    nombre: string;
}

const predefinedCategories = [
    "Diseño Gráfico",
    "Hogar",
    "Escritura",
    "Cuidado de mascotas",
    "Construcción",
    "Programación",
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [provincia, setProvincia] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [isLocalidadesLoading, setIsLocalidadesLoading] = useState(false);
  
  const [skills, setSkills] = useState("");
  
  const [photoURL, setPhotoURL] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [certificationsUrl, setCertificationsUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const CLOUDINARY_CLOUD_NAME = "julian-soto";
  const CLOUDINARY_UPLOAD_PRESET = "solucionessimples";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsLoading(true);
        const docRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setEmail(user.email || "");
            setPhone(data.phone || "");
            if (data.location) {
                const [loc, prov] = data.location.split(',').map((s: string) => s.trim());
                setLocalidad(loc);
                setProvincia(prov);
            }
            setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || "");
            setCertificationsUrl(data.certifications || "");
            setPhotoURL(data.photoURL || "");
            setRole(data.role || "");
            setCategory(data.category || "");
          } else {
              setEmail(user.email || "");
          }
        } catch (error) {
           console.error("Error fetching user data:", error);
           toast({ variant: "destructive", title: "Error", description: "No se pudo cargar tu perfil." });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading, toast]);
  
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type === "application/pdf") {
            setPdfFile(file);
        } else {
            toast({ variant: "destructive", title: "Archivo no válido", description: "Por favor, selecciona un archivo PDF." });
        }
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    let newPhotoURL = photoURL;
    let newCertificationsUrl = certificationsUrl;

    if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST", body: formData,
            });
            const data = await response.json();
            if (data.secure_url) newPhotoURL = data.secure_url;
            else throw new Error("La subida a Cloudinary falló.");
        } catch (error) {
            console.error("Error al subir la imagen: ", error);
            toast({ variant: "destructive", title: "Error de Imagen", description: "No se pudo guardar la foto de perfil." });
        }
    }
    
    if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST", body: formData,
            });
            const data = await response.json();
             if (data.secure_url) newCertificationsUrl = data.secure_url;
            else throw new Error("La subida a Cloudinary falló.");
        } catch (error) {
             console.error("Error al subir el PDF: ", error);
            toast({ variant: "destructive", title: "Error de Certificado", description: "No se pudo guardar el archivo PDF." });
        }
    }

    const locationString = (provincia && localidad) ? `${localidad}, ${provincia}` : "";

    const dataToUpdate: {[key: string]: any} = {
        firstName,
        lastName,
        email: user.email,
        phone,
        location: locationString,
        skills,
        certifications: newCertificationsUrl,
        photoURL: newPhotoURL,
        role,
    };
    
    if (role === 'trabajador') {
        const finalCategory = category === 'otro' ? otherCategory : category;
        dataToUpdate.category = finalCategory;
    }

    try {
      await setDoc(doc(db, "users", user.uid), dataToUpdate, { merge: true });
      toast({ title: "Perfil Actualizado", description: "Tu información ha sido guardada." });
      setPhotoURL(newPhotoURL);
      setCertificationsUrl(newCertificationsUrl);
    } catch (error) {
      console.error("Error al actualizar el perfil: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar tu perfil en Firestore." });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoading) {
    return (
        <div className="flex flex-col min-h-screen">
          <Header/>
          <main className="flex-grow flex items-center justify-center">
            <div className="container">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Cargando perfil...</p>
              </div>
            </div>
          </main>
        </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
        <div className="container">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>
              Actualice su información de contacto y detalles profesionales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSaveChanges}>
               <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={imagePreview || photoURL} />
                    <AvatarFallback>
                        <UserCircle className="h-full w-full text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                     <Label>Foto de perfil</Label>
                      <Input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageChange} />
                      <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()}>
                          Cambiar Foto
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG, o GIF. 5MB max.</p>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Teléfono (para WhatsApp)</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Select value={provincia} onValueChange={setProvincia}>
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
                  <Select value={localidad} onValueChange={setLocalidad} disabled={!provincia || isLocalidadesLoading}>
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
              
              {role === 'trabajador' && (
              <div className="space-y-4 pt-4 border-t">
                 <h3 className="text-lg font-semibold">Para Trabajadores</h3>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría Principal</Label>
                     <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Selecciona tu especialidad" />
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
                 <div className="space-y-2">
                    <Label htmlFor="skills">Habilidades</Label>
                    <Textarea id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
                    <p className="text-sm text-muted-foreground">
                        Lista tus habilidades separadas por comas (ej: Plomería, Electricidad).
                    </p>
                 </div>
                 <div className="space-y-2">
                    <Label>Certificado (PDF)</Label>
                    <div className="flex items-center gap-4">
                         <Button type="button" variant="outline" onClick={() => pdfInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            {pdfFile ? "Cambiar PDF" : "Subir PDF"}
                         </Button>
                         <Input type="file" accept="application/pdf" className="hidden" ref={pdfInputRef} onChange={handlePdfChange} />
                         {pdfFile ? (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">{pdfFile.name}</p>
                         ) : certificationsUrl ? (
                            <Link href={certificationsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                               <FileText className="h-4 w-4" /> Ver Certificado Actual
                            </Link>
                         ) : (
                            <p className="text-sm text-muted-foreground">No se ha subido ningún certificado.</p>
                         )}
                    </div>
                 </div>
              </div>
              )}

              <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
