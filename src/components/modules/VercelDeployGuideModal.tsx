import React, { useState } from 'react';
import { 
  Rocket, 
  CheckCircle, 
  Terminal, 
  Globe, 
  HelpCircle, 
  FileCode, 
  Copy, 
  Check, 
  AlertTriangle,
  FolderTree,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface VercelDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployGuideModal: React.FC<VercelDeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const vercelJsonContent = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-purple-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-950 p-6 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-700/60 rounded-xl border border-purple-400/30">
              <Rocket className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Manual Completo de Publicação na Vercel</h2>
              <p className="text-xs text-purple-200 mt-1">
                Projeto 100% testado e otimizado com rotas SPA, build Vite nativo e zero dependências ocultas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white p-2 rounded-lg hover:bg-purple-850 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Quick Status Check */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/80">
              <div className="flex items-center gap-2 text-purple-800 font-semibold text-xs mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Build Vite Nativo</span>
              </div>
              <p className="text-xs text-slate-600">Comando <code className="text-purple-900 font-mono font-bold">npm run build</code> configurado.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/80">
              <div className="flex items-center gap-2 text-purple-800 font-semibold text-xs mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Arquivo vercel.json</span>
              </div>
              <p className="text-xs text-slate-600">Regras de rewrite incluídas para evitar Erro 404 ao dar F5.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/80">
              <div className="flex items-center gap-2 text-purple-800 font-semibold text-xs mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Zero Variáveis Obrigatórias</span>
              </div>
              <p className="text-xs text-slate-600">Persistência local segura. Funciona no ar imediatamente.</p>
            </div>
          </div>

          {/* Passo a Passo */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-purple-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-700" />
              Passo a Passo de Implantação no Painel da Vercel
            </h3>

            {/* Passo 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs flex items-center justify-center">1</span>
                <span>Subir o código para o GitHub ou GitLab</span>
              </div>
              <p className="text-xs text-slate-600 ml-8">
                Inicialize o repositório Git local e faça o push para o seu perfil no GitHub:
              </p>
              <div className="ml-8 bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs relative overflow-x-auto">
                <pre>{`git init
git add .
git commit -m "feat: PlanoRoxo ERP completo para Vercel"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main`}</pre>
                <button
                  onClick={() => handleCopy(`git init\ngit add .\ngit commit -m "feat: PlanoRoxo ERP completo para Vercel"\ngit branch -M main\ngit remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git\ngit push -u origin main`, 'git')}
                  className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded flex items-center gap-1"
                >
                  {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'git' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs flex items-center justify-center">2</span>
                <span>Importar o Projeto no Painel da Vercel</span>
              </div>
              <div className="ml-8 text-xs text-slate-600 space-y-1.5">
                <p>1. Acesse <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-purple-700 underline font-semibold">vercel.com/dashboard</a> e clique no botão <strong>"Add New..." → "Project"</strong>.</p>
                <p>2. Selecione o repositório que você acabou de subir no GitHub e clique em <strong>"Import"</strong>.</p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-purple-950">
                <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs flex items-center justify-center">3</span>
                <span>Configurações no Painel da Vercel (Project Settings)</span>
              </div>
              <div className="ml-8 space-y-2">
                <p className="text-xs text-slate-700">A Vercel detectará o framework automaticamente. Certifique-se de que os campos estejam conforme abaixo:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Framework Preset</span>
                    <strong className="text-purple-900">Vite</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Root Directory</span>
                    <strong className="text-purple-900">./ (deixar raiz)</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Build Command</span>
                    <strong className="text-purple-900">npm run build (ou vite build)</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Output Directory</span>
                    <strong className="text-purple-900">dist</strong>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Variáveis de Ambiente (Environment Variables):</strong>
                    <p className="mt-0.5 text-slate-700">
                      Este ERP é autossuficiente e não exige nenhuma variável externa obrigatória para funcionar.
                      Caso deseje integrar com rotas de API da Gemini no futuro, declare a chave <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> no painel da Vercel em <em>Settings → Environment Variables</em>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs flex items-center justify-center">4</span>
                <span>Clique em "Deploy" e Pronto!</span>
              </div>
              <p className="text-xs text-slate-600 ml-8">
                Em aproximadamente 30 a 50 segundos, a Vercel finalizará o build e fornecerá um link público seguro HTTPS (ex: <code className="text-purple-900 font-mono">https://meu-erp-producao.vercel.app</code>) para sua empresa usar imediatamente no computador ou celular.
              </p>
            </div>
          </div>

          {/* Conteúdo do vercel.json incluído */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-purple-700" />
              Arquivo de Configuração Incluído (vercel.json)
            </h4>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs relative">
              <pre>{vercelJsonContent}</pre>
              <button
                onClick={() => handleCopy(vercelJsonContent, 'vercelJson')}
                className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded flex items-center gap-1"
              >
                {copiedKey === 'vercelJson' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'vercelJson' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Este arquivo já está presente na raiz do projeto. Ele instrui a CDN da Vercel a repassar qualquer sub-rota para o <code className="font-mono">index.html</code>, garantindo que o usuário nunca encontre telas em branco ou erros 404 ao recarregar.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Compatibilidade testada com Vite + React 19 + Tailwind v4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors"
          >
            Entendido, fechar guia
          </button>
        </div>
      </div>
    </div>
  );
};
