import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Upload, CheckCircle, XCircle, Loader2, Edit2, Image as ImageIcon } from 'lucide-react';
import { validateImageFile } from '../services/mockFloorPlanAI';
import { uploadFile, callLayoutGrid, chatWithDify } from '../services/difyService';
import { calculateBenmingFromDate } from '../utils/benmingCalculator';
import type { Room, UploadStep } from '../types/floorPlan';
import type {
    UserCompleteData,
    LayoutGridResponse,
    RoomPhotoData,
    DifyChatStreamingEvent
} from '../types/dify';

const HouseDetailsSection: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    // State management
    const [uploadStep, setUploadStep] = useState<UploadStep>('upload');
    const [floorPlanImage, setFloorPlanImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [floorPlanFileId, setFloorPlanFileId] = useState<string>('');
    const [layoutGridResult, setLayoutGridResult] = useState<LayoutGridResponse | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomPhotos, setRoomPhotos] = useState<Map<string, { file: File; fileId: string }>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [conversationId, setConversationId] = useState<string>('');
    const [chatEvents, setChatEvents] = useState<DifyChatStreamingEvent[]>([]);
    const [chatAnswer, setChatAnswer] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);

    // Personal Info State
    const [name, setName] = useState(location.state?.name || '');
    const [email] = useState(location.state?.email || '');
    const [gender, setGender] = useState<'男' | '女' | ''>('');
    const [birthDate, setBirthDate] = useState(location.state?.birthDate || '');
    const floorIndex = 1;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resolveUserId = () => (name?.trim() ? `web-${name.trim()}` : 'fengshui-web-user');

    // Handle file selection
    const handleFileSelect = (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setFloorPlanImage(file);
        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // Analyze floor plan with Dify
    const handleAnalyze = async () => {
        if (!floorPlanImage || !birthDate || !gender) {
            setError(t('dify.error.parse'));
            return;
        }

        setUploadStep('analyzing');
        setError(null);
        setAnalysisProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setAnalysisProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 300);

        try {
            // Step 1: Upload floor plan to Dify
            setAnalysisProgress(20);
            const uploadResponse = await uploadFile(floorPlanImage, resolveUserId());
            setFloorPlanFileId(uploadResponse.id);

            setAnalysisProgress(40);

            // Step 2: Call layout_grid mode
            const floorPlanDesc = `Floor ${floorIndex}, uploaded by user`;

            const userData: UserCompleteData = {
                birthDate,
                email,
                gender: gender as '男' | '女',
                floorPlanFileId: uploadResponse.id,
                name,
                floorIndex,
                languageMode: i18n.language === 'zh' ? 'zh' : 'en'
            };

            setAnalysisProgress(60);

            const { result, conversationId: newConvId } =
                await callLayoutGrid(userData, [uploadResponse.id], floorPlanDesc);

            setConversationId(newConvId);
            setLayoutGridResult(result);

            clearInterval(progressInterval);
            setAnalysisProgress(100);

            // Convert layout grid result to Room type
            if (result.houses && result.houses.length > 0) {
                const initialRooms: Room[] = result.houses.map((house, index) => ({
                    id: `room-${index}`,
                    name: house.main_room_name,
                    confidence: 0.9,
                    photo: null,
                    palace: house.palace,
                    palace_cn: house.palace_cn
                }));
                setRooms(initialRooms);
                setTimeout(() => setUploadStep('rooms'), 500);
            } else {
                setError(t('dify.error.parse'));
                setTimeout(() => setUploadStep('upload'), 1000);
            }
        } catch (err) {
            clearInterval(progressInterval);
            console.error('Analysis error:', err);
            setError(t('dify.error.api'));
            setUploadStep('upload');
        }
    };

    // Handle room name edit
    const handleRoomNameChange = (roomId: string, newName: string) => {
        setRooms(prev => prev.map(room =>
            room.id === roomId ? { ...room, name: newName } : room
        ));
    };

    // Handle room photo upload
    const handleRoomPhotoUpload = async (roomId: string, file: File) => {
        try {
            // Upload photo to Dify
            const uploadResponse = await uploadFile(file, resolveUserId());

            // Store file and fileId
            setRoomPhotos(prev => new Map(prev).set(roomId, { file, fileId: uploadResponse.id }));

            // Update room state
            setRooms(prev => prev.map(room =>
                room.id === roomId ? { ...room, photo: file } : room
            ));
        } catch (err) {
            console.error('Photo upload error:', err);
            setError(t('dify.error.upload'));
        }
    };

    const handleSampleChat = async () => {
        if (!floorPlanFileId) {
            setChatError('请先完成户型图上传和分析。');
            return;
        }

        setIsChatLoading(true);
        setChatError(null);
        setChatEvents([]);
        setChatAnswer('');

        try {
            const chatResponse = await chatWithDify({
                query: '请用一句话总结这个户型的关键信息，并提示我还需提供哪些资料。',
                inputs: {
                    mode: 'floor_plan_demo',
                    floor_index: floorIndex
                },
                fileId: floorPlanFileId,
                responseMode: 'streaming',
                conversationId,
                user: resolveUserId()
            });

            if (chatResponse.mode === 'streaming' && chatResponse.events) {
                setChatEvents(chatResponse.events);

                const aggregatedAnswer = chatResponse.events
                    .map(event => (typeof event.answer === 'string' ? event.answer : ''))
                    .join('');

                if (aggregatedAnswer) {
                    setChatAnswer(aggregatedAnswer);
                }

                const eventConversationId = chatResponse.events
                    .map(event => event.conversation_id)
                    .filter((id): id is string => Boolean(id))
                    .pop();

                if (eventConversationId) {
                    setConversationId(eventConversationId);
                }
            } else if (chatResponse.data) {
                if (chatResponse.data.answer) {
                    setChatAnswer(chatResponse.data.answer);
                }
                if (chatResponse.data.conversation_id) {
                    setConversationId(chatResponse.data.conversation_id);
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            setChatError(err instanceof Error ? err.message : 'Chat request failed.');
        } finally {
            setIsChatLoading(false);
        }
    };

    // Reset and start over
    const handleReset = () => {
        setUploadStep('upload');
        setFloorPlanImage(null);
        setImagePreview(null);
        setLayoutGridResult(null);
        setRooms([]);
        setRoomPhotos(new Map());
        setError(null);
        setAnalysisProgress(0);
        setFloorPlanFileId('');
    };

    // Continue to energy analysis
    const handleContinue = () => {
        if (!birthDate || !gender || !floorPlanFileId) {
            setError('Please fill in all required fields');
            return;
        }

        // Calculate benming star
        const { starNo, starName } = calculateBenmingFromDate(birthDate, gender);

        // Prepare room photos description
        const roomPhotosData: RoomPhotoData[] = [];
        roomPhotos.forEach((photoData, roomId) => {
            const room = rooms.find(r => r.id === roomId);
            if (room) {
                roomPhotosData.push({
                    roomId,
                    roomName: room.name,
                    fileId: photoData.fileId,
                    palace: room.palace
                });
            }
        });

        // Prepare complete user data
        const userData: UserCompleteData = {
            name,
            email,
            birthDate,
            gender,
            floorPlanFileId,
            floorIndex,
            houseGridJson: JSON.stringify(layoutGridResult),
            roomPhotos: roomPhotosData,
            conversationId,
            benmingStarNo: starNo,
            benmingStarName: starName,
            languageMode: i18n.language === 'zh' ? 'zh' : 'en'
        };

        // Navigate to consultation page
        navigate('/consultation', { state: userData });
    };

    // Calculate progress
    const roomsWithPhotos = rooms.filter(room => room.photo !== null).length;
    const totalRooms = rooms.length;

    return (
        <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center bg-gray-50 dark:bg-gray-900" id="page3">
            <div className="max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-display text-gray-800 dark:text-white">
                        {t('houseDetails.title')}
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        {t('houseDetails.subtitle')}
                    </p>
                </div>

                {/* Personal Info Inputs */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        {t('houseDetails.personalInfo.title')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('houseDetails.personalInfo.name')}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('houseDetails.personalInfo.gender')}
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as '男' | '女' | '')}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">-</option>
                                <option value="男">{t('houseDetails.personalInfo.male')}</option>
                                <option value="女">{t('houseDetails.personalInfo.female')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('houseDetails.personalInfo.birthDate')}
                            </label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">

                    {/* Step 1: Upload */}
                    {uploadStep === 'upload' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                    {t('houseDetails.upload.title')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t('houseDetails.upload.subtitle')}
                                </p>
                            </div>

                            {/* Requirements */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
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

                            {/* Upload Area */}
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${isDragging
                                    ? 'border-primary bg-amber-50 dark:bg-amber-900/20'
                                    : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />

                                {imagePreview ? (
                                    <div className="space-y-4">
                                        <img
                                            src={imagePreview}
                                            alt="Floor plan preview"
                                            className="max-h-64 mx-auto rounded-lg"
                                        />
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                {floorPlanImage?.name}
                                            </p>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-sm text-primary hover:text-amber-700 font-medium"
                                            >
                                                {t('houseDetails.upload.reupload')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                                            {t('houseDetails.upload.dragDrop')}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {t('houseDetails.upload.fileTypes')}
                                        </p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-amber-700 transition-colors"
                                        >
                                            {t('houseDetails.upload.title')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                                </div>
                            )}

                            {/* Analyze Button */}
                            {floorPlanImage && !error && (
                                <button
                                    onClick={handleAnalyze}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                    {t('houseDetails.upload.analyze')}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Step 2: Analyzing */}
                    {uploadStep === 'analyzing' && (
                        <div className="space-y-6 text-center py-12">
                            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                    {t('houseDetails.analyzing.title')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t('houseDetails.analyzing.pleaseWait')}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="max-w-md mx-auto">
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-300"
                                        style={{ width: `${analysisProgress}%` }}
                                    ></div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {analysisProgress}%
                                </p>
                            </div>

                            {/* Progress Steps */}
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <p className={analysisProgress > 30 ? 'text-green-600 dark:text-green-400' : ''}>
                                    {t('houseDetails.analyzing.step1')}
                                </p>
                                <p className={analysisProgress > 60 ? 'text-green-600 dark:text-green-400' : ''}>
                                    {t('houseDetails.analyzing.step2')}
                                </p>
                                <p className={analysisProgress > 90 ? 'text-green-600 dark:text-green-400' : ''}>
                                    {t('houseDetails.analyzing.step3')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Rooms */}
                    {uploadStep === 'rooms' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                    {t('houseDetails.rooms.title')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t('houseDetails.rooms.subtitle')}
                                </p>
                                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                    {totalRooms} {t('houseDetails.rooms.identified')}
                                </p>
                            </div>

                            {/* Rooms Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rooms.map((room) => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        onNameChange={handleRoomNameChange}
                                        onPhotoUpload={handleRoomPhotoUpload}
                                        t={t}
                                    />
                                ))}
                            </div>

                            {/* Progress */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {roomsWithPhotos} {t('houseDetails.rooms.progress')} {totalRooms}
                                </p>
                            </div>

                            {/* Dify chat demo */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">AI 问答实验室</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            使用 /chat-messages 接口实时分析刚上传的户型图。
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSampleChat}
                                        disabled={isChatLoading || !floorPlanFileId}
                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isChatLoading ? '生成中...' : '发送示例提问'}
                                    </button>
                                </div>

                                {chatError && (
                                    <p className="text-sm text-red-500">
                                        {chatError}
                                    </p>
                                )}

                                {chatAnswer && (
                                    <div className="text-sm text-gray-800 dark:text-gray-100">
                                        <p className="font-semibold mb-1">AI 回复</p>
                                        <p>{chatAnswer}</p>
                                    </div>
                                )}

                                {chatEvents.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                                            Streaming Events
                                        </p>
                                        <div className="max-h-48 overflow-y-auto bg-black text-green-400 text-xs font-mono rounded-md p-3 space-y-1">
                                            {chatEvents.map((event, index) => (
                                                <pre
                                                    key={`chat-event-${event.message_id || event.id || event.event || index}-${index}`}
                                                >
                                                    {JSON.stringify(event, null, 2)}
                                                </pre>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleReset}
                                    className="w-full sm:w-auto py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('houseDetails.errors.reuploadError')}
                                </button>
                                <button
                                    onClick={handleContinue}
                                    disabled={!birthDate || !gender}
                                    className="flex-1 py-4 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {t('houseDetails.rooms.continue')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

// Room Card Component
interface RoomCardProps {
    room: Room;
    onNameChange: (roomId: string, newName: string) => void;
    onPhotoUpload: (roomId: string, file: File) => void;
    t: TFunction;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onNameChange, onPhotoUpload, t }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(room.name);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNameSave = () => {
        onNameChange(room.id, tempName);
        setIsEditing(false);
    };

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onPhotoUpload(room.id, file);
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            {/* Room Name */}
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                        className="flex-1 px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                        autoFocus
                    />
                ) : (
                    <>
                        <h4 className="flex-1 font-semibold text-gray-800 dark:text-white">
                            {room.name}
                        </h4>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray-400 hover:text-primary transition-colors"
                            title={t('houseDetails.rooms.editName')}
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            {/* Photo Upload */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                />

                {room.photo ? (
                    <div className="relative">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 text-center">
                            {t('houseDetails.rooms.photoUploaded')}
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 w-full text-sm text-primary hover:text-amber-700"
                        >
                            {t('houseDetails.upload.reupload')}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('houseDetails.rooms.uploadPhoto')}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default HouseDetailsSection;
