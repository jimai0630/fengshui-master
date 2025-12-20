import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const InfoSection: React.FC = () => {
    const { t } = useTranslation();
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const links = [
        { key: 'faq', title: t('info.faq.title') },
        { key: 'pricing', title: t('info.pricing.title') },
        { key: 'about', title: t('info.about.title') },
        { key: 'disclaimer', title: t('info.disclaimer.title') },
        { key: 'privacy', title: t('info.privacy.title') }
    ];

    const openModal = (key: string) => {
        setActiveModal(key);
    };

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
                            <button
                                key={link.key}
                                onClick={() => openModal(link.key)}
                                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none"
                            >
                                {link.title}
                            </button>
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

            {/* Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col relative transform transition-all scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {t(`info.${activeModal}.title`)}
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                {t(`info.${activeModal}.content`)}
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 shrink-0 flex justify-end">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                            >
                                {t('common.close') || 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default InfoSection;
