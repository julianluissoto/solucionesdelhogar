import Header from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { MessageSquare } from 'lucide-react';
import Link from "next/link";

// Mock Data
const requestDetails = {
    id: 'job-1',
    title: 'Fuga de plomería de emergencia',
    description: 'Hay una fuga importante debajo del fregadero de mi cocina que necesita atención inmediata. El piso del gabinete está empapado y el agua sigue goteando continuamente incluso después de cerrar la válvula principal. La tubería parece estar corroída.',
    location: 'Nueva York, NY',
    type: 'Plomería',
    urgency: 'Emergencia',
    postedBy: {
        name: 'Jane Doe',
        phone: '15551234567' // Example phone number
    },
    image: 'https://placehold.co/600x400.png',
};

const offers = [
    { id: 'offer-1', specialist: { name: 'Mike R.', avatar: 'https://placehold.co/100x100.png' }, fee: 280, message: 'Puedo estar allí en 1 hora. Tengo todas las piezas necesarias.' },
    { id: 'offer-2', specialist: { name: 'Sarah K.', avatar: 'https://placehold.co/100x100.png' }, fee: 320, message: 'Con experiencia en fugas de emergencia. Disponible esta tarde.' },
];

export default function RequestDetailPage({ params }: { params: { id: string } }) {
    const whatsappLink = `https://wa.me/${requestDetails.postedBy.phone}?text=${encodeURIComponent(`Hola ${requestDetails.postedBy.name}, estoy interesado en tu solicitud '${requestDetails.title}' en FixIt Connect. Puedo hacerlo por...`)}`;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow p-4 md:p-8">
                <div className="container mx-auto grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-3xl font-headline">{requestDetails.title}</CardTitle>
                                        <CardDescription>{requestDetails.location}</CardDescription>
                                    </div>
                                    <Badge variant="destructive">{requestDetails.urgency}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {requestDetails.image && (
                                     <Image
                                        src={requestDetails.image}
                                        width={600}
                                        height={400}
                                        alt="Imagen de la reparación"
                                        data-ai-hint="water leak"
                                        className="rounded-lg w-full aspect-video object-cover mb-4"
                                    />
                                )}
                                <p className="text-foreground">{requestDetails.description}</p>
                                <Separator className="my-4" />
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{requestDetails.type}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Ofertas Recibidas ({offers.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {offers.map(offer => (
                                    <div key={offer.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                        <Avatar>
                                            <AvatarImage src={offer.specialist.avatar} />
                                            <AvatarFallback>{offer.specialist.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold">{offer.specialist.name}</p>
                                                <p className="text-lg font-bold text-primary">${offer.fee}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{offer.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hacer una Oferta</CardTitle>
                                <CardDescription>Contacta al propietario directamente para proporcionar tu cotización.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <p className="text-sm mb-4">Serás redirigido a WhatsApp para enviar tu oferta a <strong>{requestDetails.postedBy.name}</strong>.</p>
                                <Button asChild className="w-full">
                                    <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                        <MessageSquare className="mr-2 h-4 w-4" /> Enviar Oferta por WhatsApp
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
