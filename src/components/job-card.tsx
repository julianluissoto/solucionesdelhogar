
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface JobCardProps {
    job: Job;
}

export default function JobCard({ job }: JobCardProps) {
    const [formattedDate, setFormattedDate] = useState("");

    useEffect(() => {
        if (job.createdAt) {
            setFormattedDate(formatDistanceToNow(job.createdAt.toDate(), { addSuffix: true, locale: es }));
        }
    }, [job.createdAt]);

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-grow">
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="w-fit">{job.category}</Badge>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={job.publisherPhotoURL} />
                        <AvatarFallback>
                            <User className="h-5 w-5 text-muted-foreground"/>
                        </AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle className="pt-2">{job.title}</CardTitle>
                <CardDescription>
                    <span>por: {job.publisherName}</span>
                    <span className="block text-xs text-muted-foreground mt-1">
                        {formattedDate}
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-lg font-semibold text-primary">${job.budget.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Presupuesto (ARS)</p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/trabajos/${job.id}`}>Ver Detalles</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
