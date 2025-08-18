
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Trash2, Pencil, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, Timestamp, doc, deleteDoc, orderBy } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Job {
    id: string;
    title: string;
    budget: number;
    category: string;
    createdAt: Timestamp;
}

export default function MyJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = query(collection(db, "jobs"), where("publisherId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData: Job[] = [];
        querySnapshot.forEach((doc) => {
          jobsData.push({ id: doc.id, ...doc.data() } as Job);
        });
        jobsData.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
        setJobs(jobsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching jobs: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar tus trabajos." });
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, toast]);

  const handleDelete = async (jobId: string) => {
    setDeletingId(jobId);
    try {
        await deleteDoc(doc(db, "jobs", jobId));
        toast({ title: "Trabajo eliminado", description: "La publicación ha sido eliminada con éxito." });
    } catch (error) {
        console.error("Error eliminando trabajo: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el trabajo." });
    } finally {
        setDeletingId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Cargando tus trabajos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold font-headline">Mis Trabajos Publicados</h1>
            <Button asChild>
                <Link href="/trabajos/nuevo"><PlusCircle className="mr-2 h-4 w-4" /> Publicar Nuevo Trabajo</Link>
            </Button>
          </div>

          {jobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map(job => (
                <Card key={job.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>
                      Publicado {formatDistanceToNow(job.createdAt.toDate(), { addSuffix: true, locale: es })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Badge variant="outline">{job.category}</Badge>
                    <p className="text-lg font-semibold text-primary mt-4">${job.budget.toLocaleString()}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/mis-trabajos/editar/${job.id}`}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                        </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingId === job.id}>
                            {deletingId === job.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                            Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la publicación de tu trabajo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(job.id)}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No has publicado trabajos</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    ¡Comienza publicando tu primera oferta para encontrar al talento que necesitas!
                </p>
                <div className="mt-6">
                    <Button asChild>
                        <Link href="/trabajos/nuevo">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Publicar un Trabajo
                        </Link>
                    </Button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
