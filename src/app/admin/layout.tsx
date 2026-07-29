import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav, AdminMobileNav } from "./admin-nav";

export const metadata = {
  title: "Painel Admin — GEMgym",
};

// Gate de acesso ao painel inteiro. Roda no servidor, então nenhum byte
// de HTML do admin chega ao navegador de quem não é admin — diferente de
// um `if (role !== "admin") return null` no client, que ainda baixaria o
// bundle. `redirect` aqui joga: sem sessão → tela de login (rota raiz);
// logado mas sem role admin → também volta pra raiz (a UI lá não expõe
// nada de admin pra esse usuário).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:flex w-60 shrink-0 border-r border-border/60 bg-sidebar">
        <AdminNav user={user} />
      </div>
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl px-4 h-14 flex items-center justify-between">
          <span className="font-black tracking-tight">Painel Admin</span>
          <a href="/" className="text-xs text-muted-foreground underline underline-offset-2">
            Voltar ao app
          </a>
        </header>
        <AdminMobileNav />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
