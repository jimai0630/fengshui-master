import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const InfoSection: React.FC = () => {
    const { t } = useTranslation();

    const links = [
        { key: 'faq', title: t('info.faq.title') },
        { key: 'pricing', title: t('info.pricing.title') },
        { key: 'about', title: t('info.about.title') },
        { key: 'disclaimer', title: t('info.disclaimer.title') },
        { key: 'privacy', title: t('info.privacy.title') }
    ];

    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8" id="info">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-white mb-2">
                            {t('info.title')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                            {t('info.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8">
                        {links.map((link) => (
                            <a
                                key={link.key}
                                href="#"
                                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                            >
                                {link.title}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <p>© 2025 Feng Shui Energy. {t('info.footer')}</p>
                    <div className="flex gap-4">
                        <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            {t('nav.home')}
                        </Link>
                        <Link to="/consultation" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            {t('nav.consultation')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default InfoSection;
