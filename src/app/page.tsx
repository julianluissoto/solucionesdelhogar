
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Search, CheckCircle, FilePlus2, Briefcase, ShieldCheck, Heart, Paintbrush, Home, BookOpen, Dog, Hammer, Code } from "lucide-react";
import Header from "@/components/header";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/logo";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedReview {
    id: string;
    workerId: string;
    workerName: string;
    workerProfession: string;
    workerPhotoURL?: string;
    rating: number;
    comment: string;
}

interface PopularCategory {
    name: string;
    count: number;
    icon: React.ReactNode;
    href: string;
}


export default function HomePage() {
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [popularCategories, setPopularCategories] = useState<PopularCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const categoryIcons: { [key: string]: React.ReactNode } = {
    "Diseño Gráfico": <Paintbrush className="h-8 w-8 text-primary" />,
    "Hogar": <Home className="h-8 w-8 text-primary" />,
    "Escritura": <BookOpen className="h-8 w-8 text-primary" />,
    "Cuidado de mascotas": <Dog className="h-8 w-8 text-primary" />,
    "Construcción": <Hammer className="h-8 w-8 text-primary" />,
    "Programación": <Code className="h-8 w-8 text-primary" />,
    "Otro": <Briefcase className="h-8 w-8 text-primary" />,
  };

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
        setLoadingReviews(true);
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
                    workerPhotoURL: review.workerPhotoURL,
                    rating: review.rating,
                    comment: review.comment,
                });
            }
        }
        
        setFeaturedReviews(reviewsData.slice(0, 5)); // Limit to 5 for the carousel
        setLoadingReviews(false);
    };

    const fetchPopularCategories = async () => {
        setLoadingCategories(true);
        const jobsRef = collection(db, "jobs");
        const jobsSnap = await getDocs(jobsRef);
        const categoryCounts: { [key: string]: number } = {};

        jobsSnap.forEach(doc => {
            const job = doc.data();
            if (job.category) {
                categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
            }
        });
        
        const sortedCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([name, count]) => ({
                name,
                count,
                icon: categoryIcons[name] || <Briefcase className="h-8 w-8 text-primary" />,
                href: `/trabajos?categoria=${encodeURIComponent(name)}`
            }));
            
        setPopularCategories(sortedCategories);
        setLoadingCategories(false);
    };

    fetchFeaturedReviews();
    fetchPopularCategories();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const cardVariants = {
      hidden: { opacity: 0, y: 50 },
      visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
              delay: i * 0.2,
              duration: 0.5,
              ease: "easeOut"
          }
      })
  };

  const stats = [
    { icon: <Briefcase className="h-8 w-8 text-primary" />, value: '1,200+', label: 'Trabajos Publicados' },
    { icon: <ShieldCheck className="h-8 w-8 text-primary" />, value: '850+', label: 'Trabajadores Verificados' },
    { icon: <Heart className="h-8 w-8 text-primary" />, value: '98%', label: 'Clientes Satisfechos' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Encuentra Ayuda, Ofrece tu Talento. Simple.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    SolucionSimple conecta a personas que necesitan ayuda con tareas y proyectos con aquellos que tienen las habilidades para hacerlo. Publica un trabajo y encuentra la persona adecuada.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-2 w-full sm:w-auto">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/trabajos/nuevo">Crear un Trabajo</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                    <Link href="/trabajos">Ver Trabajos</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://res.cloudinary.com/julian-soto/image/upload/v1754075721/arte-nativo-web/unnamed_1_q9ubpx.png"
                width={550}
                height={550}
                alt="Ilustración de personas trabajando juntas"
                data-ai-hint="people working together"
                className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
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
               {[
                  { icon: <FilePlus2 className="h-6 w-6 text-primary" />, title: '1. Publica un Trabajo', description: 'Describe lo que necesitas, establece un presupuesto y publica tu trabajo para que la comunidad lo vea.'},
                  { icon: <Search className="h-6 w-6 text-primary" />, title: '2. Encuentra gente capacitada', description: 'Personas con las habilidades adecuadas exploran los trabajos disponibles y se ponen en contacto para ofrecer sus servicios.' },
                  { icon: <CheckCircle className="h-6 w-6 text-primary" />, title: '3. Soluciónalo', description: 'Eliges a la persona adecuada, se realiza el trabajo y tu problema queda resuelto. Así de simple.' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={cardVariants}
                  >
                    <Card className="flex flex-col h-full">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          {item.icon}
                        </div>
                        <CardTitle>{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        {item.description}
                      </CardContent>
                    </Card>
                  </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Explora por Categoría
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Encuentra el talento que necesitas en nuestras categorías más populares.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              {loadingCategories ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                    <Card className="h-full">
                      <CardHeader>
                        <div className="bg-muted rounded-full p-4 w-16 h-16 animate-pulse"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                popularCategories.map((category, i) => (
                  <motion.div
                    key={category.name}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={cardVariants}
                  >
                    <Link href={category.href} className="group block h-full">
                      <Card className="flex flex-col h-full hover:border-primary transition-colors">
                        <CardHeader>
                          <div className="bg-primary/10 p-4 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                            {category.icon}
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <h3 className="text-lg font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.count} trabajos disponibles</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
          <div className="container px-4 md:px-6">
             <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-3 lg:gap-12">
               {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={cardVariants}
                    className="flex flex-col items-center justify-center space-y-2 text-center"
                  >
                    {stat.icon}
                    <div className="text-4xl font-bold">{stat.value}</div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
             </div>
          </div>
        </motion.section>

        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Lo que dicen nuestros clientes</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Historias reales de personas que encontraron la solución perfecta en nuestra comunidad.
                        </p>
                    </div>
                </div>
                <div className="mt-12">
                    {loadingReviews ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-lg">Cargando testimonios...</p>
                        </div>
                    ) : featuredReviews.length > 0 ? (
                        <Carousel
                            plugins={[plugin.current]}
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
                                                        <AvatarImage src={review.workerPhotoURL || undefined} alt={review.workerName}/>
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
        </motion.section>

      </main>
      <footer className="flex items-center justify-center py-6 border-t">
        <div className="container px-4 md:px-6 flex justify-center">
            <p className="text-sm text-muted-foreground">
              © 2024 SolucionSimple. Todos los derechos reservados.
            </p>
        </div>
      </footer>
    </div>
  );
}
