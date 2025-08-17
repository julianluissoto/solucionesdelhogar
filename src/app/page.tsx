
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Search, CheckCircle } from "lucide-react";
import Header from "@/components/header";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/logo";
import { Loader2 } from "lucide-react";

interface FeaturedReview {
    id: string;
    workerId: string;
    workerName: string;
    workerProfession: string;
    workerPhotoURL?: string;
    rating: number;
    comment: string;
}


export default function HomePage() {
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
        setLoading(true);
        const workersRef = collection(db, "users");
        // We get workers who have reviews. A simple way is to get workers and then their reviews.
        // A more scalable way would be to have a "hasReviews" flag on the worker.
        // For now, let's get some workers and then get their best review.
        const qWorkers = query(workersRef, where("role", "==", "trabajador"), limit(10));
        const workerSnap = await getDocs(qWorkers);
        
        const reviewsData: FeaturedReview[] = [];

        for (const workerDoc of workerSnap.docs) {
            const worker = workerDoc.data();
            const reviewsRef = collection(db, "users", workerDoc.id, "reviews");
            const qReviews = query(reviewsRef, orderBy("rating", "desc"), limit(1));
            const reviewSnap = await getDocs(qReviews);

            if (!reviewSnap.empty) {
                const reviewDoc = reviewSnap.docs[0];
                const review = reviewDoc.data();
                reviewsData.push({
                    id: reviewDoc.id,
                    workerId: workerDoc.id,
                    workerName: `${worker.firstName} ${worker.lastName}`,
                    workerProfession: worker.category || 'Trabajador',
                    workerPhotoURL: worker.photoURL,
                    rating: review.rating,
                    comment: review.comment,
                });
            }
        }
        
        setFeaturedReviews(reviewsData.slice(0, 5)); // Limit to 5 for the carousel
        setLoading(false);
    };

    fetchFeaturedReviews();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Encuentra Ayuda, Ofrece tu Talento. Simple.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    SolucionesSimple conecta a personas que necesitan ayuda con tareas y proyectos con aquellos que tienen las habilidades para hacerlo. Publica un trabajo y encuentra la persona adecuada.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/trabajos/nuevo">Crear un Trabajo</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/trabajos">Ver Trabajos</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://res.cloudinary.com/julian-soto/image/upload/v1754075721/arte-nativo-web/unnamed_1_q9ubpx.png"
                width="600"
                height="400"
                alt="Ilustración de personas trabajando juntas"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Cómo Funciona
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Un proceso simple y directo para resolver tus necesidades.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Logo className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>1. Publica un Trabajo</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  Describe lo que necesitas, establece un presupuesto y publica tu trabajo para que la comunidad lo vea.
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>2. Encuentra gente capacitada</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  Personas con las habilidades adecuadas exploran los trabajos disponibles y se ponen en contacto para ofrecer sus servicios.
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                   <div className="bg-primary/10 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>3. Soluciónalo</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  Eliges a la persona adecuada, se realiza el trabajo y tu problema queda resuelto. Así de simple.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Lo que dicen nuestros clientes</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Historias reales de personas que encontraron la solución perfecta en nuestra comunidad.
                        </p>
                    </div>
                </div>
                <div className="mt-12">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-lg">Cargando testimonios...</p>
                        </div>
                    ) : featuredReviews.length > 0 ? (
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full max-w-4xl mx-auto"
                        >
                            <CarouselContent>
                                {featuredReviews.map((review) => (
                                <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1 h-full">
                                        <Card className="flex flex-col h-full">
                                            <CardHeader className="flex-grow">
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={review.workerPhotoURL} alt={review.workerName}/>
                                                        <AvatarFallback>{review.workerName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{review.workerName}</p>
                                                        <StarRating rating={review.rating} variant="display" />
                                                    </div>
                                                </div>
                                                 <div className="mt-2">
                                                    <Badge variant="secondary">{review.workerProfession}</Badge>
                                                 </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-sm text-muted-foreground italic">&quot;{review.comment}&quot;</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/trabajadores/${review.workerId}`}>Ver Perfil</Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    ) : (
                        <p className="text-center text-muted-foreground">Aún no hay testimonios disponibles.</p>
                    )}
                </div>
            </div>
        </section>

      </main>
      <footer className="flex items-center justify-center py-6 border-t">
        <div className="px-4 md:px-6 flex justify-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Soluciones Simples. Creado por Julian Soto Todos los derechos reservados.
            </p>
        </div>
      </footer>
    </div>
  );
}
