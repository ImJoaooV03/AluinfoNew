import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useRegion } from '../../contexts/RegionContext';

const Login = () => {
  const navigate = useNavigate();
  const { region, logoUrl } = useRegion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        const targetRegion = region || 'pt';
        navigate(`/${targetRegion}/admin`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Tradução de erros comuns do Supabase
      if (err.message === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('E-mail não confirmado. Verifique sua caixa de entrada.');
      } else if (err.message.includes('Database error querying schema') || err.status === 500) {
        setError('Erro de configuração do usuário (Identidade ausente). Execute a migração de correção no banco de dados.');
      } else {
        setError(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-[#111] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
          <div className="relative z-10">
            <img 
                src={logoUrl || "/logo.png"} 
                alt="AluInfo" 
                className="h-16 w-auto mx-auto mb-4 object-contain"
                onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + '/logo.png') {
                        e.currentTarget.src = '/logo.png';
                    }
                }}
            />
            <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Acesso Restrito ({region.toUpperCase()})</p>
          </div>
          
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-red-700 font-bold">Erro de Acesso</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2" htmlFor="email">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2" htmlFor="password">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-600 cursor-pointer select-none">
                  Lembrar-me
                </label>
              </div>

              <div className="text-xs">
                <a href="#" className="font-medium text-primary hover:text-primary-hover transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md hover:shadow-lg",
                loading ? "opacity-75 cursor-not-allowed" : ""
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Autenticando...
                </>
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              &copy; 2025 AluInfo Portal. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
