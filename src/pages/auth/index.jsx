import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { Button } from '@/components/ui/button/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserType } from '@/routes/userType'; // Enum com os tipos de usuário

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loginEmailSenha = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;
      const db = getDatabase();
      const userRef = ref(db, `usuarios/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userRole = userData.funcao?.trim();

        if (!userRole) {
          toast.error("Nível de acesso não definido.");
          await auth.signOut();
          setIsLoading(false);
          return;
        }

        switch (userRole) {
          case UserType.ADMIN:
            toast.success("Bem-vindo, Administrador!");
            navigate('/Home');
            break;
          case UserType.COORDENADOR:
            toast.success("Bem-vindo, Coordenador!");
            navigate('/Home');
            break;
          case UserType.AUXILIAR:
            toast.success("Bem-vindo, Auxiliar!");
            navigate('/Home');
            break;
          case UserType.DIRETOR:
            toast.success("Bem-vindo, Diretor!");
            navigate('/diretor/relatorios');
            break;
          default:
            toast.error("Tipo de usuário inválido.");
            await auth.signOut();
            break;
        }
      } else {
        toast.error('Usuário não autorizado');
        await auth.signOut();
      }
    } catch (err) {
      console.error(err);
      setError('E-mail ou senha inválidos.');
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const redefinirSenha = async () => {
    if (!email) return toast.warning('Digite seu e-mail para redefinir');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Link de redefinição enviado para seu e-mail');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar e-mail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-purple-700 to-blue-900 p-4">
      <ToastContainer />
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-34 h-34 rounded-full flex items-center justify-center shadow-lg">
              <img src="/Reciclar_LOGO.png" alt="Logo Instituto Reciclar" className="w-26 h-26 object-contain" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800">Instituto Reciclar</CardTitle>
              <CardDescription className="text-gray-600 mt-2">Plataforma Educacional</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={loginEmailSenha} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="@reciclar.org.br"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    disabled={isLoading}
                    required
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                  </>
                ) : (
                  'Acessar Plataforma'
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="link"
                onClick={redefinirSenha}
                disabled={isLoading}
                className="text-sm text-purple-600 hover:text-purple-800 transition-colors p-0 h-auto font-normal"
              >
                Esqueci minha senha
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Ao fazer login, você concorda com nossos{' '}
                <Link to="#" className="text-purple-600 hover:underline">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link to="#" className="text-purple-600 hover:underline">
                  Política de Privacidade
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Precisa de ajuda?{' '}
            <Link to="#" className="text-white hover:underline font-medium">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
