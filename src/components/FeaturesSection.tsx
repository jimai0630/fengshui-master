import { useTranslation } from 'react-i18next';

const FeaturesSection: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden gradient-bg"
            id="features"
        >
            {/* Energy Flow Animation Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-8 py-20">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 md:p-16 border border-amber-200 dark:border-amber-800">
                    <h2 className="text-4xl md:text-5xl font-bold font-display text-gray-800 dark:text-white mb-6 text-center drop-shadow-sm">
                        {t('features.title')}
                    </h2>
                    <div className="space-y-6 text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                        <p className="text-center drop-shadow-sm">
                            {t('features.intro')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-white/60 dark:bg-black/40 p-6 rounded-xl border border-amber-100 dark:border-amber-900 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-3xl mb-3">🧘‍♀️</div>
                                <h3 className="font-semibold text-xl mb-2 text-gray-900 dark:text-white">
                                    {t('features.feature1.title')}
                                </h3>
                                <p className="text-base text-gray-700 dark:text-gray-300">
                                    {t('features.feature1.description')}
                                </p>
                            </div>
                            <div className="bg-white/60 dark:bg-black/40 p-6 rounded-xl border border-amber-100 dark:border-amber-900 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-3xl mb-3">✨</div>
                                <h3 className="font-semibold text-xl mb-2 text-gray-900 dark:text-white">
                                    {t('features.feature2.title')}
                                </h3>
                                <p className="text-base text-gray-700 dark:text-gray-300">
                                    {t('features.feature2.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
