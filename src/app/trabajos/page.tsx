
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Loader2, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import SpecificShareButton from "@/components/specific-share-button";

interface Job {
    id: string;
    title: string;
    publisherName: string;
    publisherPhotoURL?: string;
    budget: number;
    description: string;
    category: string;
    location: string;
    createdAt: Timestamp;
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobUrl, setJobUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
        setJobUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (id) {
      const fetchJob = async () => {
        setLoading(true);
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setJobDetails({ id: docSnap.id, ...docSnap.data() } as Job);
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      };
      fetchJob();
    }
  }, [id]);

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: es });
  };

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p>Cargando detalles del trabajo...</p>
                </div>
            </main>
        </div>
    );
  }

  if (!jobDetails) {
     return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <p>No se pudo encontrar el trabajo.</p>
            </main>
        </div>
    );
  }

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`Hola, estoy interesado en el trabajo '${jobDetails.title}' que publicaste en SolucionSimple. ${jobUrl}`)}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <Button variant="outline" asChild>
                    <Link href="/trabajos">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Trabajos
                    </Link>
                </Button>
                {jobUrl && (
                    <SpecificShareButton 
                        title={`Oferta de Trabajo: ${jobDetails.title}`}
                        text={`Mira esta oportunidad de trabajo en SolucionSimple: ${jobDetails.title}`}
                        url={jobUrl}
                        buttonVariant="outline"
                    />
                )}
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-headline">{jobDetails.title}</CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={jobDetails.publisherPhotoURL} />
                                            <AvatarFallback>
                                                <User className="h-5 w-5 text-muted-foreground"/>
                                            </AvatarFallback>
                                        </Avatar>
                                        <CardDescription>
                                            Publicado por: {jobDetails.publisherName} en {jobDetails.location}
                                            <span className="block text-xs text-muted-foreground/80 mt-1">
                                                {formatDate(jobDetails.createdAt)}
                                            </span>
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="default">{jobDetails.category}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Descripción</h3>
                                <p className="text-muted-foreground">{jobDetails.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Presupuesto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-primary">${jobDetails.budget.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Presupuesto máximo (ARS)</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Contactar al Anunciante</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                    <MessageSquare className="mr-2 h-4 w-4" /> Enviar Mensaje
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
