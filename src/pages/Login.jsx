import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Leaf } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1542601906990-24d4c16419d9?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-primary-900/90 backdrop-blur-sm"></div>

            <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex flex-col items-center">
                    <div className="bg-white p-3 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform">
                        <Leaf className="h-10 w-10 text-primary-600" />
                    </div>
                    <h2 className="text-center text-4xl font-extrabold text-white tracking-tight">
                        EcoTrack
                    </h2>
                    <p className="mt-2 text-center text-sm text-primary-100">
                        Sign in to monitor and reduce your carbon footprint
                    </p>
                </div>

                <Card className="mt-8 py-8 px-10 shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="bg-gray-50"
                        />

                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full py-2.5 shadow-lg shadow-primary-500/20"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-400">
                                    New to EcoTrack?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link to="/register">
                                <Button variant="secondary" className="w-full">
                                    Create an account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
