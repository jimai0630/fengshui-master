import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lunar } from 'lunar-javascript';
import { X } from 'lucide-react';

// Import zodiac fortunes data
import { zodiacFortunes } from '../data/zodiacFortunes';
import type { ZodiacFortune } from '../data/zodiacFortunes';

const UserInfoSection: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [nickname, setNickname] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ email?: string; date?: string }>({});
    const [zodiacReport, setZodiacReport] = useState<{ zodiac: string; fortune: ZodiacFortune } | null>(null);
    const [showModal, setShowModal] = useState(false);

    const zodiacMap: Record<string, string> = {
        '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit',
        '龙': 'Dragon', '蛇': 'Snake', '马': 'Horse', '羊': 'Goat',
        '猴': 'Monkey', '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig'
    };

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const calculateZodiac = (dateStr: string): string | null => {
        try {
            const date = new Date(dateStr);
            const lunar = Lunar.fromDate(date);
            const zodiacCN = lunar.getYearShengXiao();
            return zodiacMap[zodiacCN] || null;
        } catch (error) {
            console.error('Error calculating zodiac:', error);
            return null;
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { email?: string; date?: string } = {};

        if (!email || !validateEmail(email)) {
            newErrors.email = t('userInfo.emailRequired');
        }

        if (!birthDate) {
            newErrors.date = t('userInfo.dateRequired');
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            const zodiacKey = calculateZodiac(birthDate);
            if (zodiacKey && zodiacFortunes[zodiacKey]) {
                setZodiacReport({
                    zodiac: zodiacKey,
                    fortune: zodiacFortunes[zodiacKey]
                });
            }
        }
    };

    const handlePreview = () => {
        if (zodiacReport) {
            setShowModal(true);
        }
    };

    const currentLang = i18n.language === 'zh' ? 'zh' : 'en';
    const displayName = nickname || (currentLang === 'zh' ? '亲爱的你' : 'Dear you');

    return (
        <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center bg-background-light dark:bg-background-dark" id="page2">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="text-center lg:text-left">
                    <p className="text-xl md:text-2xl leading-relaxed text-gray-700 dark:text-gray-300 mb-8 font-medium">
                        {t('userInfo.description')}
                    </p>
                    <div className="flex justify-center lg:justify-start">
                        <img
                            alt="Woman meditating"
                            className="w-64 h-auto object-contain"
                            src="/meditation-woman.png"
                        />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900/50 p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-white mb-4">{t('userInfo.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">{t('userInfo.subtitle')}</p>
                    <form onSubmit={handleSend} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="nickname">
                                {t('userInfo.nickname')}
                            </label>
                            <input
                                className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white"
                                id="nickname"
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="birthDate">
                                {t('userInfo.birthDate')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white ${errors.date ? 'border-red-500' : ''}`}
                                id="birthDate"
                                type="date"
                                value={birthDate}
                                onChange={(e) => {
                                    setBirthDate(e.target.value);
                                    setErrors({ ...errors, date: undefined });
                                }}
                            />
                            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                                {t('userInfo.email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white ${errors.email ? 'border-red-500' : ''}`}
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors({ ...errors, email: undefined });
                                }}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                            >
                                {t('userInfo.send')}
                            </button>
                            {zodiacReport && (
                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    className="flex-1 flex justify-center py-3 px-4 border border-primary rounded-md shadow-sm text-sm font-medium text-primary bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                                >
                                    {t('userInfo.preview')}
                                </button>
                            )}
                        </div>
                        {zodiacReport && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                <p className="text-sm text-green-800 dark:text-green-200 text-center">
                                    {zodiacReport.fortune.icon} {t('userInfo.reportReady')}
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Modal */}
            {showModal && zodiacReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                            <h3 className="text-2xl font-bold font-display text-gray-800 dark:text-white">
                                {zodiacReport.fortune.icon} {displayName} - 2025-2026 {currentLang === 'zh' ? '运势' : 'Fortune'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {zodiacReport.fortune.intro[currentLang]}
                                </p>
                            </div>

                            {Object.entries(zodiacReport.fortune.sections).map(([key, content]) => (
                                <div key={key} className="border-l-4 border-primary pl-4">
                                    <h4 className="text-lg font-semibold text-primary mb-2 capitalize">
                                        {currentLang === 'zh' ?
                                            ({ love: '感情', wealth: '财运', health: '健康', career: '事业', luck: '运气' }[key]) :
                                            key}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                        {content[currentLang]}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-amber-700 transition-colors font-medium"
                            >
                                {currentLang === 'zh' ? '关闭' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default UserInfoSection;
