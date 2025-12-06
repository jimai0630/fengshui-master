import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showConsultationDropdown, setShowConsultationDropdown] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'zh' : 'en';
        i18n.changeLanguage(newLang);
    };

    const toggleLogin = () => {
        setIsLoggedIn(!isLoggedIn);
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/70 backdrop-blur-md shadow-lg' : 'bg-black/30 backdrop-blur-sm'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-white font-display text-xl font-bold">
                            FengShui
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                {t('nav.home')}
                            </Link>

                            {/* Consultation Dropdown */}
                            <div
                                className="relative"
                                onMouseEnter={() => setShowConsultationDropdown(true)}
                                onMouseLeave={() => setShowConsultationDropdown(false)}
                            >
                                <button className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                                    {t('nav.consultation')}
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${showConsultationDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {showConsultationDropdown && (
                                    <div className="absolute left-0 pt-2 w-48">
                                        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                                            <Link
                                                to="/consultation"
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-primary transition-colors"
                                            >
                                                {t('nav.homeConsultation')}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                {t('nav.blog')}
                            </a>
                        </div>
                    </div>

                    {/* Right Side Icons (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={toggleLanguage}
                            className="text-gray-300 hover:text-white p-2 rounded-full transition-colors flex items-center gap-1 text-sm"
                        >
                            <Globe size={18} />
                            <span>{i18n.language === 'en' ? 'EN' : '中'}</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-black/90 backdrop-blur-md">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                            {t('nav.home')}
                        </Link>
                        <Link to="/consultation" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                            {t('nav.homeConsultation')}
                        </Link>
                        <a href="#" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                            {t('nav.blog')}
                        </a>
                        <button
                            onClick={toggleLanguage}
                            className="w-full text-left text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            {i18n.language === 'en' ? 'Switch to 中文' : 'Switch to English'}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
