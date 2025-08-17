
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, MapPin, ArrowLeft, Star, Send, FileText } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, doc, getDoc, addDoc, serverTimestamp, orderBy, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/star-rating";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import SpecificShareButton from "@/components/specific-share-button";

interface Worker {
    id: string;
    firstName: string;
    lastName: string;
    location: string;
    skills: string;
    category?: string;
    certifications: string; // This will now be a URL to the PDF
    phone: string;
    photoURL?: string;
    role: string;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    authorName: string;
    authorId: string;
    createdAt: any;
}

export default function WorkerProfilePage() {
  const params = useParams();
  const workerId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(true);
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
     if (workerId) {
        setProfileUrl(window.location.origin + `/trabajadores/${workerId}`);
    }
  }, [workerId]);

  useEffect(() => {
    if (!workerId) {
        setLoading(false);
        return;
    };

    const fetchWorker = async () => {
      setLoading(true);
      const docRef = doc(db, "users", workerId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().role === 'trabajador') {
        setWorker({ id: docSnap.id, ...docSnap.data() } as Worker);
      } else {
        // Handle worker not found
        setWorker(null);
      }
      setLoading(false);
    };

    fetchWorker();

    const reviewsRef = collection(db, "users", workerId, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reviewsData: Review[] = [];
        let totalRating = 0;
        querySnapshot.forEach((doc) => {
            const review = { id: doc.id, ...doc.data() } as Review;
            reviewsData.push(review);
            totalRating += review.rating;
        });
        setReviews(reviewsData);
        setAvgRating(reviewsData.length > 0 ? totalRating / reviewsData.length : 0);
    });
    
    return () => unsubscribe();
  }, [workerId]);

  useEffect(() => {
    const checkIfReviewed = async () => {
        if (!user || !workerId) {
            setCheckingReview(false);
            return;
        }
        setCheckingReview(true);
        const reviewsRef = collection(db, "users", workerId, "reviews");
        const q = query(reviewsRef, where("authorId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setHasReviewed(!querySnapshot.empty);
        setCheckingReview(false);
    };

    if (!authLoading) {
        checkIfReviewed();
    }
  }, [user, workerId, authLoading]);


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Debes iniciar sesión para dejar un comentario." });
        return;
    }
    if (newRating === 0 || newComment.trim() === "") {
        toast({ variant: "destructive", title: "Por favor, añade una calificación y un comentario." });
        return;
    }
    
    // Final check to prevent double submission
    const reviewsRefCheck = collection(db, "users", workerId, "reviews");
    const qCheck = query(reviewsRefCheck, where("authorId", "==", user.uid));
    const querySnapshotCheck = await getDocs(qCheck);

    if (!querySnapshotCheck.empty) {
        toast({ variant: "destructive", title: "Ya has dejado un comentario para este especialista." });
        setHasReviewed(true);
        return;
    }
    
    setIsSubmitting(true);
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const authorName = userDoc.exists() ? `${userDoc.data().firstName} ${userDoc.data().lastName}` : "Anónimo";

    try {
        const reviewsRef = collection(db, "users", workerId, "reviews");
        await addDoc(reviewsRef, {
            authorId: user.uid,
            authorName,
            comment: newComment,
            rating: newRating,
            createdAt: serverTimestamp()
        });
        toast({ title: "¡Gracias!", description: "Tu comentario ha sido publicado." });
        setNewComment("");
        setNewRating(0);
        setHasReviewed(true);
    } catch (error) {
        console.error("Error al añadir comentario: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo publicar tu comentario." });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading || authLoading) {
    return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </main>
        </div>
    );
  }
  
  if (!worker) {
     return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <p>No se pudo encontrar el perfil del trabajador.</p>
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8 bg-muted/5">
        <div className="container mx-auto max-w-4xl">
            <div className="mb-6 flex justify-between items-center">
                 <Button variant="outline" asChild>
                    <Link href="/trabajadores">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Especialistas
                    </Link>
                </Button>
                {profileUrl && (
                     <SpecificShareButton 
                        title={`Perfil de ${worker.firstName} ${worker.lastName}`}
                        text={`Echa un vistazo al perfil de ${worker.firstName} en SolucionSimple.`}
                        url={profileUrl}
                        buttonVariant="outline"
                    />
                )}
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                     <Card>
                        <CardHeader className="items-center text-center">
                             <Avatar className="h-32 w-32 mb-4 border-4 border-primary/20">
                                <AvatarImage src={worker.photoURL} alt={`${worker.firstName} ${worker.lastName}`} />
                                <AvatarFallback>
                                    <User className="h-16 w-16 text-muted-foreground"/>
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{worker.firstName} {worker.lastName}</CardTitle>
                             <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                               <StarRating rating={avgRating} totalStars={5} variant="display" />
                               <span className="font-bold">{avgRating.toFixed(1)}</span>
                               <span>({reviews.length} reseñas)</span>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center space-y-3 text-sm">
                           <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                {worker.location || 'Ubicación no especificada'}
                           </div>
                           <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4 text-primary" />
                                {authLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : user ? (
                                    <a href={`https://wa.me/${worker.phone}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{worker.phone}</a>
                                ) : (
                                    <span className="italic text-xs">
                                       <Link href="/login" className="underline">Inicia sesión</Link> para ver
                                    </span>
                                )}
                           </div>
                        </CardContent>
                     </Card>
                </div>
                 <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sobre {worker.firstName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Habilidades</h3>
                                <div className="flex flex-wrap gap-2">
                                    {worker.category && <Badge variant="default">{worker.category}</Badge>}
                                    {worker.skills ? worker.skills.split(',').map(skill => (
                                        skill.trim() && <Badge key={skill.trim()} variant="secondary">{skill.trim()}</Badge>
                                    )) : <p className="text-sm text-muted-foreground">No hay habilidades listadas.</p>}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold mb-2">Certificaciones</h3>
                                {worker.certifications ? (
                                    <Button variant="outline" asChild>
                                        <a href={worker.certifications} target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 h-4 w-4"/> Ver Certificado
                                        </a>
                                    </Button>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay certificaciones listadas.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dejar un Comentario</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {authLoading || checkingReview ? (
                                 <div className="flex items-center justify-center p-4">
                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...
                                 </div>
                             ) : !user ? (
                                <div className="text-center p-4 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground mb-4">Debes iniciar sesión para dejar un comentario.</p>
                                    <Button asChild>
                                        <Link href="/login">Iniciar Sesión</Link>
                                    </Button>
                                </div>
                            ) : hasReviewed ? (
                                <p className="text-center p-4 text-sm text-muted-foreground">Ya has dejado un comentario para este especialista. Gracias por tu feedback.</p>
                            ) : (
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <div>
                                        <label className="font-semibold mb-2 block">Tu Calificación</label>
                                        <StarRating rating={newRating} totalStars={5} variant="interactive" onRate={setNewRating} />
                                    </div>
                                    <Textarea 
                                        placeholder={`¿Cómo fue tu experiencia con ${worker.firstName}?`}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Enviar Comentario
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Reseñas ({reviews.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                           {reviews.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Ver todas las reseñas</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="p-4 border rounded-md">
                                             <div className="flex justify-between items-center mb-2">
                                                <p className="font-semibold">{review.authorName}</p>
                                                <StarRating rating={review.rating} variant="display" />
                                             </div>
                                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        </div>
                                    ))}
                                    </AccordionContent>
                                </AccordionItem>
                             </Accordion>
                           ): (
                            <p className="text-sm text-muted-foreground text-center py-4">Este especialista aún no tiene reseñas. ¡Sé el primero!</p>
                           )}
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
}
