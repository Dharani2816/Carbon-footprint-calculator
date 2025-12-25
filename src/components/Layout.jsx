import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, LayoutDashboard, Calculator, History, Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                                    <img src="/eco-logo.png" alt="EcoTrack Logo" className="h-8 w-8" />
                                    <span className="text-xl font-bold text-gray-900 tracking-tight">EcoTrack</span>
                                </Link>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                <Link
                                    to="/"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')
                                        ? 'border-primary-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/calculator"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/calculator')
                                        ? 'border-primary-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <Calculator className="w-4 h-4 mr-2" />
                                    Calculator
                                </Link>
                                <Link
                                    to="/history"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/history')
                                        ? 'border-primary-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <History className="w-4 h-4 mr-2" />
                                    History
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="hidden sm:flex items-center">
                                {user ? (
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Link to="/login">
                                            <Button variant="ghost" size="sm">Login</Button>
                                        </Link>
                                        <Link to="/register">
                                            <Button size="sm">Register</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? (
                                        <X className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Menu className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden bg-white border-t border-gray-200">
                        <div className="pt-2 pb-3 space-y-1">
                            <Link
                                to="/"
                                onClick={closeMobileMenu}
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/')
                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <LayoutDashboard className="w-5 h-5 mr-3" />
                                    Dashboard
                                </div>
                            </Link>
                            <Link
                                to="/calculator"
                                onClick={closeMobileMenu}
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/calculator')
                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <Calculator className="w-5 h-5 mr-3" />
                                    Calculator
                                </div>
                            </Link>
                            <Link
                                to="/history"
                                onClick={closeMobileMenu}
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/history')
                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <History className="w-5 h-5 mr-3" />
                                    History
                                </div>
                            </Link>
                        </div>
                        <div className="pt-4 pb-4 border-t border-gray-200">
                            {user ? (
                                <div className="flex items-center px-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                            {user.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">{user.name}</div>
                                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        <LogOut className="h-6 w-6" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 space-y-1 px-4">
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="block text-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMobileMenu}
                                        className="block text-center w-full mt-2 px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <p className="text-sm text-gray-500">© 2025 EcoTrack. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-gray-500">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-gray-500">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
