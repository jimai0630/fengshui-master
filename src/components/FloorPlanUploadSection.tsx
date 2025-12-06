import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Plus, CheckCircle, XCircle } from 'lucide-react';
import type { HouseType, FloorPlanUpload, UserCompleteData } from '../types/dify';

interface FloorPlanUploadSectionProps {
    initialUserData?: Partial<UserCompleteData>;
    onComplete: (uploads: FloorPlanUpload[], houseType: HouseType, userData: Partial<UserCompleteData>) => void;
    onAnalyzing: () => void;
}

const HOUSE_TYPE_FLOOR_DEFAULTS: Record<HouseType, number> = {
    apartment: 1,
    condo: 1,
    villa: 2,
    loft: 2,
    other: 1
};

const MAX_FLOORS = 3;

const FloorPlanUploadSection: React.FC<FloorPlanUploadSectionProps> = ({
    initialUserData,
    onComplete,
    onAnalyzing
}) => {
    const { t } = useTranslation();

    // User info state
    const [name, setName] = useState(initialUserData?.name || '');
    const [email, setEmail] = useState(initialUserData?.email || '');
    const [gender, setGender] = useState<'男' | '女' | ''>(initialUserData?.gender || '');
    const [birthDate, setBirthDate] = useState(initialUserData?.birthDate || '');

    const [houseType, setHouseType] = useState<HouseType>('apartment');
    const [floorPlans, setFloorPlans] = useState<FloorPlanUpload[]>([
        { floorIndex: 1, file: null as unknown as File }
    ]);
    const [isDragging, setIsDragging] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Update floor count when house type changes
    const handleHouseTypeChange = (newType: HouseType) => {
        setHouseType(newType);
        const defaultFloors = HOUSE_TYPE_FLOOR_DEFAULTS[newType];

        // Reset floor plans to default count
        const newFloorPlans: FloorPlanUpload[] = Array.from(
            { length: defaultFloors },
            (_, i) => ({ floorIndex: i + 1, file: null as unknown as File })
        );
        setFloorPlans(newFloorPlans);
        setError(null);
    };

    const validateImageFile = (file: File): { valid: boolean; error?: string } => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: t('floorPlan.errors.invalidType')
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: t('floorPlan.errors.tooLarge')
            };
        }

        return { valid: true };
    };

    const handleFileSelect = (floorIndex: number, file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error || t('floorPlan.errors.invalidFile'));
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFloorPlans(prev => prev.map(fp =>
                fp.floorIndex === floorIndex
                    ? { ...fp, file, preview: reader.result as string }
                    : fp
            ));
        };
        reader.readAsDataURL(file);
        setError(null);
    };

    const handleDragOver = (e: React.DragEvent, floorIndex: number) => {
        e.preventDefault();
        setIsDragging(floorIndex);
    };

    const handleDragLeave = () => {
        setIsDragging(null);
    };

    const handleDrop = (e: React.DragEvent, floorIndex: number) => {
        e.preventDefault();
        setIsDragging(null);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(floorIndex, file);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, floorIndex: number) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(floorIndex, file);
        }
    };

    const handleAddFloor = () => {
        if (floorPlans.length >= MAX_FLOORS) {
            setError(t('floorPlan.errors.maxFloors'));
            return;
        }

        setFloorPlans(prev => [
            ...prev,
            { floorIndex: prev.length + 1, file: null as unknown as File }
        ]);
    };

    const handleRemoveFloor = (floorIndex: number) => {
        if (floorPlans.length <= 1) {
            return;
        }

        setFloorPlans(prev =>
            prev
                .filter(fp => fp.floorIndex !== floorIndex)
                .map((fp, idx) => ({ ...fp, floorIndex: idx + 1 }))
        );
    };

    const handleAnalyze = () => {
        // Validate user info
        if (!email || !gender || !birthDate) {
            setError(t('floorPlan.errors.missingUserInfo'));
            return;
        }

        // Check if all floors have files
        const allUploaded = floorPlans.every(fp => fp.file);
        if (!allUploaded) {
            setError(t('floorPlan.errors.missingFiles'));
            return;
        }

        const userData: Partial<UserCompleteData> = {
            name: name.trim() || undefined,
            email: email.trim(),
            gender: gender as '男' | '女',
            birthDate
        };

        onAnalyzing();
        onComplete(floorPlans, houseType, userData);
    };

    const allFilesUploaded = floorPlans.every(fp => fp.file);
    const canAnalyze = allFilesUploaded && email && gender && birthDate;

    return (
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-white mb-2">
                        {t('houseDetails.title')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('houseDetails.subtitle')}
                    </p>
                </div>

                {/* Combined Info Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {t('houseDetails.personalInfo.title')}
                        </h3>
                        {(initialUserData?.name || initialUserData?.email || initialUserData?.birthDate) && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {t('houseDetails.personalInfo.prefilled')}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('houseDetails.personalInfo.name')}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!!initialUserData?.name}
                                className={`w-full px-3 py-2 rounded-md border text-sm ${initialUserData?.name
                                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('houseDetails.personalInfo.email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!!initialUserData?.email}
                                className={`w-full px-3 py-2 rounded-md border text-sm ${initialUserData?.email
                                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('houseDetails.personalInfo.birthDate')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                disabled={!!initialUserData?.birthDate}
                                max={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 py-2 rounded-md border text-sm ${initialUserData?.birthDate
                                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('houseDetails.personalInfo.gender')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as '男' | '女' | '')}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            >
                                <option value="">-</option>
                                <option value="男">{t('houseDetails.personalInfo.male')}</option>
                                <option value="女">{t('houseDetails.personalInfo.female')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('houseDetails.upload.houseType')}
                            </label>
                            <select
                                value={houseType}
                                onChange={(e) => handleHouseTypeChange(e.target.value as HouseType)}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            >
                                <option value="apartment">{t('houseDetails.upload.types.apartment')}</option>
                                <option value="condo">{t('houseDetails.upload.types.condo')}</option>
                                <option value="villa">{t('houseDetails.upload.types.villa')}</option>
                                <option value="loft">{t('houseDetails.upload.types.loft')}</option>
                                <option value="other">{t('houseDetails.upload.types.other')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Requirements Info */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                        {t('houseDetails.upload.requirements')}
                    </h4>
                    <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-300">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{t('houseDetails.upload.req1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{t('houseDetails.upload.req2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{t('houseDetails.upload.req3')}</span>
                        </li>
                    </ul>
                </div>

                {/* Floor Plan Uploads */}
                <div className="space-y-4 mb-4">
                    {floorPlans.map((floorPlan, index) => (
                        <div
                            key={floorPlan.floorIndex}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                    {t('houseDetails.upload.floor')} {floorPlan.floorIndex}F
                                </h3>
                                {floorPlans.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveFloor(floorPlan.floorIndex)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title={t('houseDetails.upload.removeFloor')}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Upload Area */}
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${isDragging === floorPlan.floorIndex
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                    : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                onDragOver={(e) => handleDragOver(e, floorPlan.floorIndex)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, floorPlan.floorIndex)}
                            >
                                <input
                                    ref={el => { fileInputRefs.current[index] = el; }}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                    onChange={(e) => handleFileInputChange(e, floorPlan.floorIndex)}
                                    className="hidden"
                                />

                                {floorPlan.preview ? (
                                    <div className="space-y-2">
                                        <img
                                            src={floorPlan.preview}
                                            alt={`Floor ${floorPlan.floorIndex} plan`}
                                            className="max-h-32 mx-auto rounded-lg"
                                        />
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                {floorPlan.file?.name}
                                            </p>
                                            <button
                                                onClick={() => fileInputRefs.current[index]?.click()}
                                                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                                            >
                                                {t('houseDetails.upload.reupload')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('houseDetails.upload.dragDrop')}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {t('houseDetails.upload.fileTypes')}
                                        </p>
                                        <button
                                            onClick={() => fileInputRefs.current[index]?.click()}
                                            className="mt-2 px-4 py-1.5 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition-colors"
                                        >
                                            {t('houseDetails.upload.selectFile')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Floor Button */}
                {floorPlans.length < MAX_FLOORS && (
                    <button
                        onClick={handleAddFloor}
                        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all flex items-center justify-center gap-2 mb-4"
                    >
                        <Plus className="w-4 h-4" />
                        {t('houseDetails.upload.addFloor')}
                    </button>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {t('houseDetails.upload.analyze')}
                </button>
            </div>
        </section>
    );
};

export default FloorPlanUploadSection;
