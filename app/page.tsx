import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, Target, BarChart3, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-white">FinMotorista</h1>
          <div className="flex gap-4">
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/signup">Começar agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4 text-balance">
            Controle financeiro inteligente para motoristas de aplicativo
          </h2>
          <p className="text-xl text-slate-400 mb-8 text-pretty">
            Tome decisões baseadas em dados reais. Maximize seu lucro, minimize despesas e alcance suas metas
            financeiras.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/signup">Criar conta grátis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-700 bg-transparent"
            >
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <div className="p-6 rounded-lg bg-slate-800/50 backdrop-blur border border-slate-700">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Análise Inteligente</h3>
            <p className="text-slate-400">Receba insights automáticos sobre seu desempenho e sugestões de melhoria</p>
          </div>

          <div className="p-6 rounded-lg bg-slate-800/50 backdrop-blur border border-slate-700">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Dashboards Completos</h3>
            <p className="text-slate-400">Visualize seu faturamento, despesas e lucro líquido em tempo real</p>
          </div>

          <div className="p-6 rounded-lg bg-slate-800/50 backdrop-blur border border-slate-700">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Metas Financeiras</h3>
            <p className="text-slate-400">Defina objetivos e acompanhe seu progresso automaticamente</p>
          </div>

          <div className="p-6 rounded-lg bg-slate-800/50 backdrop-blur border border-slate-700">
            <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100% Seguro</h3>
            <p className="text-slate-400">Seus dados protegidos com criptografia de ponta a ponta</p>
          </div>
        </div>

        <div className="text-center bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-12">
          <h3 className="text-3xl font-bold text-white mb-4">Pronto para maximizar seus lucros?</h3>
          <p className="text-slate-400 mb-6">
            Junte-se a centenas de motoristas que já estão no controle de suas finanças
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/signup">Começar agora gratuitamente</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-slate-700 mt-16">
        <div className="container mx-auto p-6 text-center text-slate-400">
          <p>&copy; 2025 FinMotorista. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
