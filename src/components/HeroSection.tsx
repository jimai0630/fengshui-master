import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeroSection: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section
            className="h-screen min-h-[700px] w-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
            id="page1"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/yoga_meditation_background.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="font-display text-5xl md:text-7xl font-bold text-white shadow-sm mb-6">{t('hero.title')}</h1>
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
                    {t('hero.subtitle')}
                </p>
                <Link
                    to="/consultation"
                    className="inline-block bg-primary hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    {t('hero.cta')}
                </Link>
            </div>
        </section>
    );
};

export default HeroSection;
