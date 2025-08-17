import Header from "@/components/header";
import { RequestForm } from "@/components/request-form";

export default function NewRequestPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center space-y-8">
        <RequestForm />
      </main>
    </div>
  );
}
