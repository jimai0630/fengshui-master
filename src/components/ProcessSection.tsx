import { useTranslation } from 'react-i18next';

const ProcessSection: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" id="process">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-display text-gray-800 dark:text-white mb-6">
                        {t('reportContent.title')}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        {t('reportContent.subtitle')}
                    </p>
                </div>

                {/* Main Content: Left Text + Right Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Report Content Description */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                                {t('reportContent.whatIncluded')}
                            </h3>

                            <div className="space-y-4">
                                {/* Item 1 */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                            {t('reportContent.item1.title')}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('reportContent.item1.description')}
                                        </p>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                            {t('reportContent.item2.title')}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('reportContent.item2.description')}
                                        </p>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                            {t('reportContent.item3.title')}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('reportContent.item3.description')}
                                        </p>
                                    </div>
                                </div>

                                {/* Item 4 */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                        4
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                            {t('reportContent.item4.title')}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('reportContent.item4.description')}
                                        </p>
                                    </div>
                                </div>

                                {/* Item 5 */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                        5
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                            {t('reportContent.item5.title')}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('reportContent.item5.description')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Pentagon Chart */}
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                                {t('reportContent.pentagon.title')}
                            </h3>
                            <div className="relative w-full max-w-sm aspect-square">
                                <div className="pentagon">
                                    <svg viewBox="0 0 100 95.1">
                                        <polygon className="dark:stroke-gray-700" fill="none" points="50,0 100,34.55 80.9,95.1 19.1,95.1 0,34.55" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <polygon className="dark:stroke-gray-700" fill="none" points="50,19.02 80.9,43.77 72.72,76.08 27.28,76.08 19.1,43.77" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <polygon className="dark:stroke-gray-700" fill="#F3F4F6" points="50,38.04 61.8,53 64.54,57.06 35.46,57.06 38.2,53" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="50" x2="19.1" y1="0" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="50" x2="80.9" y1="0" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="0" x2="100" y1="34.55" y2="34.55"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="0" x2="80.9" y1="34.55" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="100" x2="19.1" y1="34.55" y2="95.1"></line>
                                        {/* Before adjustment - smaller */}
                                        <polygon fill="rgba(156, 163, 175, 0.3)" points="50,25 75,45 65,80 35,80 25,45" stroke="#9CA3AF" strokeWidth="1.5"></polygon>
                                        {/* After adjustment - larger */}
                                        <polygon fill="rgba(217, 119, 6, 0.3)" points="50,10 90,34.55 75,90 25,90 10,34.55" stroke="#D97706" strokeWidth="2"></polygon>
                                    </svg>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '-5%', left: '50%' }}>{t('reportContent.pentagon.love')}</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '34.55%', left: '105%' }}>{t('reportContent.pentagon.wealth')}</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '95.1%', left: '85%' }}>{t('reportContent.pentagon.career')}</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '95.1%', left: '15%' }}>{t('reportContent.pentagon.health')}</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '34.55%', left: '-5%' }}>{t('reportContent.pentagon.luck')}</div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-center space-x-6">
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-gray-400 mr-2"></span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('reportContent.pentagon.before')}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-primary mr-2"></span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('reportContent.pentagon.after')}</span>
                                </div>
                            </div>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 max-w-sm">
                                {t('reportContent.pentagon.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProcessSection;
