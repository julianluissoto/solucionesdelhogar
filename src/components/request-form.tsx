"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { estimateRepairCost, EstimateRepairCostOutput } from "@/ai/flows/estimate-repair-cost";

const formSchema = z.object({
  requestType: z.string().min(1, "Por favor seleccione un tipo de solicitud."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  location: z.string().min(2, "Por favor ingrese una ubicación válida."),
  urgency: z.string().min(1, "Por favor seleccione un nivel de urgencia."),
});

type FormValues = z.infer<typeof formSchema>;

export function RequestForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<EstimateRepairCostOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestType: "",
      description: "",
      location: "",
      urgency: "",
    },
  });

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setEstimation(null);
    try {
      let imageUri: string | undefined = undefined;
      if (imageFile) {
        imageUri = await toBase64(imageFile);
      }
      
      const result = await estimateRepairCost({ ...values, imageUri });
      setEstimation(result);
      toast({
        title: "Estimación Completa",
        description: "Su estimación de costo de reparación está lista.",
      });
      // Optionally redirect or update UI further
      // router.push('/dashboard');
    } catch (error) {
      console.error("Error al obtener la estimación:", error);
      toast({
        variant: "destructive",
        title: "Falló la Estimación",
        description: "Hubo un error al obtener su estimación. Por favor, inténtelo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Enviar una Solicitud de Reparación</CardTitle>
          <CardDescription>
            Complete los detalles a continuación. Nuestra IA proporcionará una estimación de tarifa sugerida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Solicitud</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un servicio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="plumbing">Plomería</SelectItem>
                        <SelectItem value="electrical">Electricidad</SelectItem>
                        <SelectItem value="carpentry">Carpintería</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el problema en detalle..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cuanto más detalle, mejor será la estimación.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="ej., San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgencia</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="¿Qué tan urgente es esto?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="emergency">Emergencia</SelectItem>
                        <SelectItem value="within 24 hours">Dentro de 24 horas</SelectItem>
                        <SelectItem value="within a week">Dentro de una semana</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Imagen del Problema (Opcional)</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </FormControl>
                <FormDescription>
                  Una imagen ayuda a los especialistas a comprender el problema.
                </FormDescription>
              </FormItem>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Estimando Costo...
                  </>
                ) : (
                  "Obtener Estimación de IA y Enviar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {estimation && (
        <Card className="w-full max-w-2xl mt-8">
            <CardHeader>
                <CardTitle>Sugerencia de Tarifa de IA</CardTitle>
                <CardDescription>Basado en los detalles proporcionados, aquí está nuestra tarifa sugerida.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-4xl font-bold text-primary">${estimation.suggestedRate.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Tarifa Sugerida (USD)</p>
                </div>
                <div>
                    <h4 className="font-semibold">Factores Considerados:</h4>
                    <p className="text-sm text-muted-foreground">{estimation.factors}</p>
                </div>
                 <Button className="w-full" onClick={() => router.push('/dashboard')}>
                    Confirmar y Publicar Solicitud
                </Button>
            </CardContent>
        </Card>
      )}
    </>
  );
}
