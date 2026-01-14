import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lunar } from 'lunar-javascript';
import { X, Info } from 'lucide-react';
import { zodiacFortunes } from '../data/zodiacFortunes';
import { queryPaidConsultationsByUser } from '../services/supabaseService';
import type { ConsultationRecord } from '../services/supabaseService';
import type { ZodiacFortune } from '../data/zodiacFortunes';

const UserInfoSection: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // Form State
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');

    // Date State
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');

    const [errors, setErrors] = useState<{ email?: string; date?: string; year?: string; month?: string; day?: string }>({});
    const [zodiacReport, setZodiacReport] = useState<{ zodiac: string; fortune: ZodiacFortune } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showExistingReportDialog, setShowExistingReportDialog] = useState(false);
    const [existingReports, setExistingReports] = useState<ConsultationRecord[]>([]);

    const zodiacMap: Record<string, string> = {
        '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit',
        '龙': 'Dragon', '蛇': 'Snake', '马': 'Horse', '羊': 'Goat',
        '猴': 'Monkey', '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig'
    };

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateDate = (): boolean => {
        const y = parseInt(year);
        const m = parseInt(month);
        const d = parseInt(day);
        const currentYear = new Date().getFullYear();
        const newErrors: typeof errors = {};

        if (!year) newErrors.year = t('userInfo.required');
        else if (isNaN(y) || y < 1900 || y > currentYear) newErrors.year = t('userInfo.invalidYear');

        if (!month) newErrors.month = t('userInfo.required');
        else if (isNaN(m) || m < 1 || m > 12) newErrors.month = t('userInfo.invalidMonth');

        if (!day) newErrors.day = t('userInfo.required');
        else {
            const daysInMonth = new Date(y, m, 0).getDate();
            if (isNaN(d) || d < 1 || d > daysInMonth) newErrors.day = t('userInfo.invalidDay');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors({ ...errors, ...newErrors });
            return false;
        }

        setErrors({ ...errors, year: undefined, month: undefined, day: undefined });
        return true;
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

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: typeof errors = {};

        // Reset errors
        setErrors({});

        let isValid = true;

        if (!email || !validateEmail(email)) {
            newErrors.email = t('userInfo.emailRequired');
            isValid = false;
        }

        if (!validateDate()) {
            isValid = false;
        }

        if (!isValid) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return;
        }

        const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Query existing paid consultations
        try {
            const paidReports = await queryPaidConsultationsByUser(email, dateStr);

            if (paidReports.length > 0) {
                // Found existing paid reports, show confirmation dialog
                setExistingReports(paidReports);
                setShowExistingReportDialog(true);
                return;
            }
        } catch (error) {
            console.error('[UserInfoSection] Failed to query paid consultations:', error);
            // Continue with normal flow if query fails
        }

        // No existing paid reports, show zodiac modal (original flow)
        const zodiac = calculateZodiac(dateStr);
        if (zodiac && zodiacFortunes[zodiac]) {
            setZodiacReport({
                zodiac: zodiac,
                fortune: zodiacFortunes[zodiac]
            });
            setShowModal(true);

            // Auto-subscribe
            console.log('Subscription:', { email, nickname, birthDate: dateStr, zodiac: zodiac });
        }
    };

    const currentLang = i18n.language === 'zh' ? 'zh' : 'en';
    const displayName = nickname || (currentLang === 'zh' ? '亲爱的你' : 'Dear you');

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 flex items-center bg-background-light dark:bg-background-dark" id="user-info">
            <div className="max-w-4xl mx-auto w-full"> {/* Increased max-w for better horizontal layout if needed, but keeping it compact inside */}
                <div className="bg-white dark:bg-gray-900/80 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-800 dark:text-white mb-3">
                            {t('userInfo.title')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                            {t('userInfo.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSend} className="max-w-xl mx-auto space-y-5">
                        {/* Name Input */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                {t('userInfo.nickname')}
                            </label>
                            <input
                                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white py-2 px-3 sm:text-sm"
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder={currentLang === 'zh' ? '您的称呼 (选填)' : 'Your Name (Optional)'}
                            />
                        </div>

                        {/* Birth Date - Split Inputs */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                {t('userInfo.birthDate')} <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="relative">
                                    <input
                                        className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white py-2 px-3 sm:text-sm ${errors.year ? 'border-red-500' : ''}`}
                                        type="number"
                                        placeholder="YYYY"
                                        value={year}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 4) setYear(e.target.value);
                                            setErrors({ ...errors, year: undefined, date: undefined });
                                        }}
                                    />
                                    <span className="absolute right-2 top-2 text-gray-400 text-xs">年</span>
                                </div>
                                <div className="relative">
                                    <input
                                        className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white py-2 px-3 sm:text-sm ${errors.month ? 'border-red-500' : ''}`}
                                        type="number"
                                        placeholder="MM"
                                        min="1" max="12"
                                        value={month}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 2) setMonth(e.target.value);
                                            setErrors({ ...errors, month: undefined, date: undefined });
                                        }}
                                    />
                                    <span className="absolute right-2 top-2 text-gray-400 text-xs">月</span>
                                </div>
                                <div className="relative">
                                    <input
                                        className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white py-2 px-3 sm:text-sm ${errors.day ? 'border-red-500' : ''}`}
                                        type="number"
                                        placeholder="DD"
                                        min="1" max="31"
                                        value={day}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 2) setDay(e.target.value);
                                            setErrors({ ...errors, day: undefined, date: undefined });
                                        }}
                                    />
                                    <span className="absolute right-2 top-2 text-gray-400 text-xs">日</span>
                                </div>
                            </div>
                            {(errors.year || errors.month || errors.day || errors.date) && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.year || errors.month || errors.day || errors.date}
                                </p>
                            )}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                {t('userInfo.email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white py-2 px-3 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors({ ...errors, email: undefined });
                                }}
                                placeholder="example@email.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="pt-2">
                            {!zodiacReport ? (
                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-full shadow-md text-base font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200"
                                >
                                    {currentLang === 'zh' ? '订阅我们，免费获取运势指南' : 'Subscribe & Get Free Fortune Guide'}
                                </button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(true)}
                                        className="w-full flex justify-center py-3 px-4 border border-primary rounded-full shadow-sm text-sm font-bold text-primary bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {t('userInfo.reportReady')} (Check Again)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                                            navigate('/consultation', {
                                                state: {
                                                    name: nickname,
                                                    birthDate: dateStr,
                                                    email: email,
                                                    reset: true
                                                }
                                            });
                                        }}
                                        className="w-full flex justify-center py-4 px-6 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 animate-pulse"
                                    >
                                        {currentLang === 'zh' ? '开启您的居家能量探索' : 'Start Your Home Energy Exploration'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal */}
            {showModal && zodiacReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col transform transition-all scale-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 p-5 flex justify-between items-center shrink-0">
                            <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="text-3xl">{zodiacReport.fortune.icon}</span>
                                <span>{displayName} - 2025/26 {currentLang === 'zh' ? '运势' : 'Fortune'}</span>
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="mb-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                    {zodiacReport.fortune.intro[currentLang]}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(zodiacReport.fortune.sections).map(([key, content]) => (
                                    <div key={key} className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-gradient-to-b before:from-amber-400 before:to-orange-500 before:rounded-full">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2 capitalize flex items-center gap-2">
                                            {currentLang === 'zh' ?
                                                ({ love: '感情', wealth: '财运', health: '健康', career: '事业', luck: '运气' }[key]) :
                                                key}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base whitespace-pre-line text-justify">
                                            {content[currentLang]}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 p-5 shrink-0">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                                    setTimeout(() => {
                                        navigate('/consultation', {
                                            state: {
                                                name: nickname,
                                                birthDate: dateStr,
                                                email: email,
                                                reset: true
                                            }
                                        });
                                    }, 100);
                                }}
                                className="w-full py-3.5 px-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {currentLang === 'zh' ? '✨ 开启下一步：居家能量探索' : 'Next Step: Home Energy Exploration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Reports Confirmation Dialog */}
            {showExistingReportDialog && existingReports.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <Info className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {t('userInfo.existingReportTitle') || '发现已购买报告'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('userInfo.existingReportMessage') || '您之前已购买过风水报告，是否直接查看？'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Report List */}
                        <div className="p-6 max-h-60 overflow-y-auto">
                            {existingReports.map((report, index) => (
                                <div key={report.id} className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {t('userInfo.reportGeneratedAt', '生成时间')}: {new Date(report.paid_at || report.updated_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            {t('userInfo.houseType', '房型')}: {report.house_type}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowExistingReportDialog(false);
                                    // Create new analysis, show zodiac modal
                                    const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                                    const zodiac = calculateZodiac(dateStr);
                                    if (zodiac && zodiacFortunes[zodiac]) {
                                        setZodiacReport({
                                            zodiac: zodiac,
                                            fortune: zodiacFortunes[zodiac]
                                        });
                                        setShowModal(true);
                                    }
                                }}
                                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {t('userInfo.createNewAnalysis') || '创建新分析'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowExistingReportDialog(false);
                                    // Navigate to report page using the latest record
                                    const latestReport = existingReports[0];
                                    const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                                    navigate('/consultation', {
                                        state: {
                                            restore: true,
                                            consultationId: latestReport.id,
                                            email: email
                                        }
                                    });
                                }}
                                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                            >
                                {t('userInfo.viewExistingReport') || '查看已有报告'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default UserInfoSection;
