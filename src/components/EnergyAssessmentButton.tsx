import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
    onClick: () => void;
    loading: boolean;
};

const EnergyAssessmentButton: React.FC<Props> = ({ onClick, loading }) => {
    const { t } = useTranslation();
    return (
        <div className="flex justify-center py-8">
            <button
                onClick={onClick}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                ) : null}
                {t('energyForecast.title')}
            </button>
        </div>
    );
};

export default EnergyAssessmentButton;
