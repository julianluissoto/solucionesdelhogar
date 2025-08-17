"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp, OrderByDirection } from "firebase/firestore";
import Link from "next/link";
import JobCard from "@/components/job-card";

interface Job {
    id: string;
    title: string;
    publisherName: string;
    publisherPhotoURL?: string;
    budget: number;
    category: string;
    provincia: string;
    createdAt: Timestamp;
}

const ALL_PROVINCES = "Todas las provincias";

export default function JobsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedProvincia, setSelectedProvincia] = useState(ALL_PROVINCES);
  const [sortOrder, setSortOrder] = useState<OrderByDirection>("desc");
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [provincias, setProvincias] = useState<string[]>([ALL_PROVINCES]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "jobs"), orderBy("createdAt", sortOrder));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData: Job[] = [];
        const categorySet = new Set<string>();
        const provinciaSet = new Set<string>();

        querySnapshot.forEach((doc) => {
            const job = { id: doc.id, ...doc.data() } as Job;
            jobsData.push(job);
            if(job.category) {
              categorySet.add(job.category);
            }
            if(job.provincia) {
              provinciaSet.add(job.provincia);
            }
        });
        setAllJobs(jobsData);
        setCategories(["Todos", ...Array.from(categorySet).sort()]);
        setProvincias([ALL_PROVINCES, ...Array.from(provinciaSet).sort()]);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching jobs: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [sortOrder]);

  useEffect(() => {
    let jobs = allJobs;
    if (selectedCategory !== "Todos") {
        jobs = jobs.filter(job => job.category === selectedCategory);
    }
    if (selectedProvincia !== ALL_PROVINCES) {
        jobs = jobs.filter(job => job.provincia === selectedProvincia);
    }
    setFilteredJobs(jobs);
  }, [selectedCategory, selectedProvincia, allJobs]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold font-headline">Trabajos Disponibles</h1>
            <Button asChild>
                <Link href="/trabajos/nuevo"><PlusCircle className="mr-2 h-4 w-4" /> Publicar un Trabajo</Link>
            </Button>
          </div>
          
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
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
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as OrderByDirection)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Ordenar por fecha" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="desc">Más recientes</SelectItem>
                      <SelectItem value="asc">Más antiguos</SelectItem>
                  </SelectContent>
              </Select>
          </div>

          {loading ? (
             <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Cargando trabajos...</p>
              </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No hay trabajos disponibles que coincidan con tu búsqueda.</p>
                    </div>
                )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}