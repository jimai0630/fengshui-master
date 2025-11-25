

import { useTranslation } from 'react-i18next';

const HeroSection: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="h-screen min-h-[700px] w-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden gradient-bg" id="page1">
            <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="font-display text-5xl md:text-7xl font-bold text-white shadow-sm mb-6">{t('hero.title')}</h1>
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
                    {t('hero.subtitle')}
                </p>
                <a className="bg-white text-primary font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-opacity-90 transition-transform duration-300 ease-in-out hover:scale-105" href="#page2">
                    {t('hero.cta')}
                </a>
            </div>
        </section>
    );
};

export default HeroSection;
