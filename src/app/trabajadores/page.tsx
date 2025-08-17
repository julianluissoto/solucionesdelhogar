
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, MapPin, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, getDocs, collectionGroup } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "@/components/star-rating";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface Worker {
    id: string;
    firstName: string;
    lastName: string;
    location: string;
    skills: string;
    phone: string;
    photoURL?: string;
    category?: string;
    reviewCount: number;
    avgRating: number;
}

const ALL_PROVINCES = "Todas las provincias";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [provincias, setProvincias] = useState<string[]>([ALL_PROVINCES]);
  const [selectedProvincia, setSelectedProvincia] = useState(ALL_PROVINCES);
  
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "trabajador"));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        setLoading(true);
        const workersData: Worker[] = [];
        const categorySet = new Set<string>();
        const provinciaSet = new Set<string>();

        for (const doc of querySnapshot.docs) {
            const workerData = doc.data();
            // Basic validation to ensure we have a worker object
            if (!workerData.firstName || !workerData.lastName) continue;

            const worker = { id: doc.id, ...workerData } as Omit<Worker, 'reviewCount' | 'avgRating'>;
            
            if (workerData.category) {
                categorySet.add(workerData.category);
            }
            if (workerData.location) {
                 const provincia = workerData.location.split(',')[1]?.trim();
                 if(provincia) provinciaSet.add(provincia);
            }
            
            const reviewsRef = collection(db, "users", doc.id, "reviews");
            const reviewsSnap = await getDocs(reviewsRef);

            let totalRating = 0;
            reviewsSnap.forEach(reviewDoc => {
                totalRating += reviewDoc.data().rating;
            });
            
            const reviewCount = reviewsSnap.size;
            const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;

            workersData.push({ ...worker, reviewCount, avgRating });
        };
        setAllWorkers(workersData);
        setWorkers(workersData);
        setCategories(["Todos", ...Array.from(categorySet).sort()]);
        setProvincias([ALL_PROVINCES, ...Array.from(provinciaSet).sort()]);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching workers: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
   useEffect(() => {
    let filtered = allWorkers;

    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(worker => 
          (worker.category && worker.category === selectedCategory)
      );
    }
    
    if (selectedProvincia !== ALL_PROVINCES) {
        filtered = filtered.filter(worker => worker.location && worker.location.toLowerCase().includes(selectedProvincia.toLowerCase()));
    }

    setWorkers(filtered);
  }, [selectedCategory, selectedProvincia, allWorkers]);


  const renderPhoneNumber = (phone: string) => {
    if (authLoading) {
      return <div className="h-5 w-24 bg-muted rounded animate-pulse" />;
    }
    if (user) {
      return <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline text-sm">{phone}</a>;
    }
    return (
       <Link href="/login">
            <Button variant="outline" size="sm">
                Iniciar sesión para ver
            </Button>
       </Link>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold font-headline">Encuentra a un trabajador</h1>
            <p className="text-lg text-muted-foreground mt-2">Explora nuestra comunidad de trabajadores calificados listos para ayudarte.</p>
          </div>
          
           <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                      {categories.map(category => (
                          <SelectItem key={category} value={category}>
                              {category}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
               <Select value={selectedProvincia} onValueChange={setSelectedProvincia}>
                  <SelectTrigger>
                      <SelectValue placeholder="Filtrar por provincia" />
                  </SelectTrigger>
                  <SelectContent>
                      {provincias.map(prov => (
                          <SelectItem key={prov} value={prov}>
                              {prov}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>

          {loading ? (
             <div className="flex items-center justify-center gap-2 mt-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">Cargando Trabajadores...</p>
              </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {workers.length > 0 ? (
                    workers.map(worker => (
                    <Card key={worker.id} className="flex flex-col">
                        <CardHeader className="items-center text-center">
                            <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                                <AvatarImage src={worker.photoURL} alt={`${worker.firstName} ${worker.lastName}`} />
                                <AvatarFallback>
                                    <User className="h-10 w-10 text-muted-foreground"/>
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle>{worker.firstName} {worker.lastName}</CardTitle>
                            <CardDescription className="flex items-center gap-2 text-xs"><MapPin className="h-4 w-4"/>{worker.location || 'Ubicación no especificada'}</CardDescription>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                               <StarRating rating={worker.avgRating} totalStars={5} variant="display" />
                               <span>({worker.reviewCount})</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col items-center text-center space-y-4">
                           <div className="space-y-2 flex-grow">
                               <h3 className="font-semibold text-xs uppercase text-muted-foreground">Oficios</h3>
                               <div className="flex flex-wrap gap-1 justify-center">
                                {worker.category && <Badge variant="default" className="m-1">{worker.category}</Badge>}
                                {worker.skills && worker.skills.split(',').slice(0, 2).map(skill => (
                                   skill.trim() && <Badge key={skill.trim()} variant="secondary" className="m-1">{skill.trim()}</Badge>
                                ))}
                               </div>
                           </div>
                           <div className="flex items-center justify-center gap-2 pt-4 border-t w-full">
                                <Phone className="h-4 w-4 text-primary" />
                                {!authLoading && renderPhoneNumber(worker.phone)}
                                {authLoading && <div className="h-5 w-24 bg-muted rounded animate-pulse" />}
                           </div>
                        </CardContent>
                         <CardFooter>
                             <Button asChild className="w-full">
                                <Link href={`/trabajadores/${worker.id}`}>
                                    Ver Perfil
                                </Link>
                            </Button>
                         </CardFooter>
                    </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No se encontraron Trabajadores que coincidan con tu búsqueda.</p>
                    </div>
                )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
