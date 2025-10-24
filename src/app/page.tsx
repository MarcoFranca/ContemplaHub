// src/app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
      <main className="min-h-dvh grid place-items-center p-8">
        <Card className="w-full max-w-xl shadow-sm animate-in fade-in-0 zoom-in-95 duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Autentika — Smoke Test</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-gray-600">
              Se tipografia/espaçamentos estão ok, Tailwind v4 está ok.
            </p>

            <div className="flex gap-3 p-4 rounded-lg border">
              <Button className="px-4 py-2">Botão shadcn</Button>
              <a href="#" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                Link padrão
              </a>
            </div>

            <div className="rounded-xl bg-black p-4 text-sm">
              Teste: <code>.p-4</code>, <code>.rounded-xl</code>, <code>.bg-black</code>
            </div>

            <div className="m-4 p-6 bg-gray-500 rounded-lg">
              Fora do Card: margin e padding também funcionam.
            </div>
          </CardContent>
        </Card>
      </main>
  );
}

