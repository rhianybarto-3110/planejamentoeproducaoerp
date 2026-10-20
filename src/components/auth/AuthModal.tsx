import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Factory, Lock, Mail, User, Building2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, register, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      if (!email || !password) {
        setErrorMsg('Por favor, preencha o e-mail e a senha.');
        return;
      }
      const success = login(email, password);
      if (!success) {
        setErrorMsg('Não foi possível entrar. Verifique os dados fornecidos.');
      }
    } else {
      if (!name || !email || !password || !company) {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('A senha deve conter no mínimo 4 caracteres.');
        return;
      }
      const success = register(name, email, password, company);
      if (!success) {
        setErrorMsg('Falha ao criar conta. Revise os campos.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
        {/* Header / Brand */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-700/60 border border-purple-400/30 text-white mb-3 shadow-inner">
            <Factory className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">PlanoRoxo ERP</h2>
          <p className="mt-1 text-xs text-purple-200 max-w-xs mx-auto">
            Planejamento e Controle da Produção para pequenas empresas e oficinas industriais
          </p>

          {/* Quick Demo Access banner */}
          <button
            type="button"
            onClick={loginAsDemo}
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-lg shadow-sm transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Entrar com Demonstração Instantânea (1 Clique)
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-purple-100 bg-purple-50/50 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'login'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-purple-600 hover:text-purple-900'
            }`}
          >
            Acessar Conta
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'register'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-purple-600 hover:text-purple-900'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-purple-50/30 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome da Empresa / Fábrica *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Oficina Mecânica & Design"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-purple-50/30 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              E-mail de Acesso *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gestor@empresa.com.br"
                className="w-full pl-9 pr-3 py-2 text-sm bg-purple-50/30 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Senha *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-purple-50/30 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-medium text-sm rounded-lg shadow-md shadow-purple-900/10 flex items-center justify-center gap-2 transition-colors"
          >
            <span>{mode === 'login' ? 'Entrar no Sistema' : 'Concluir Cadastro e Iniciar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 bg-purple-50/60 border-t border-purple-100 text-center text-xs text-purple-700">
          Dados armazenados de forma segura e permanente no seu navegador.
        </div>
      </div>
    </div>
  );
};
