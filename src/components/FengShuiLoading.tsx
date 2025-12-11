import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FengShuiLoading = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = [
        "正在调阅风水大师的秘籍宝典...",
        "正在排盘2026年流年飞星...",
        "大师正在感知您家的气场流动...",
        "正在推演家中吉凶方位...",
        "大师正在为您撰写运势寄语...",
        "能量场分析中，请稍候...",
        "正在为您寻找化解之道..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000); // Change message every 3 seconds

        return () => clearInterval(interval);
    }, []);

    // 9-Star Positions (Lo Shu Grid style)
    const stars = [
        { id: 1, color: "text-blue-500", bg: "bg-blue-100", x: 0, y: 60 },      // 1 (Water) - North (Bottom)
        { id: 2, color: "text-gray-800", bg: "bg-gray-200", x: 60, y: -60 },    // 2 (Earth) - SW (Top-Right)
        { id: 3, color: "text-emerald-500", bg: "bg-emerald-100", x: -60, y: 0 }, // 3 (Wood) - East (Left)
        { id: 4, color: "text-emerald-600", bg: "bg-emerald-200", x: -60, y: -60 },// 4 (Wood) - SE (Top-Left)
        { id: 5, color: "text-amber-500", bg: "bg-amber-100", x: 0, y: 0, main: true }, // 5 (Earth) - Center
        { id: 6, color: "text-gray-600", bg: "bg-gray-200", x: 60, y: 60 },     // 6 (Metal) - NW (Bottom-Right)
        { id: 7, color: "text-rose-500", bg: "bg-rose-100", x: 60, y: 0 },      // 7 (Metal) - West (Right)
        { id: 8, color: "text-amber-100", bg: "bg-amber-50", x: -60, y: 60 },   // 8 (Earth) - NE (Bottom-Left)
        { id: 9, color: "text-purple-500", bg: "bg-purple-100", x: 0, y: -60 },   // 9 (Fire) - South (Top)
    ];

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full h-full min-h-[400px]">
            {/* Animation Container */}
            <div className="relative w-64 h-64 mb-12 flex items-center justify-center">

                {/* 1. Background Glow/Aura */}
                <motion.div
                    className="absolute inset-0 bg-amber-500/20 rounded-full blur-[40px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* 2. Rotating Bagua/Compass Ring (Mystical Element) */}
                <motion.div
                    className="absolute inset-0 border-[1px] border-amber-900/10 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute inset-2 border-[1px] border-amber-900/5 rounded-full border-dashed"></div>
                </motion.div>

                {/* Reverse Rotating Ring */}
                <motion.div
                    className="absolute inset-8 border-[1px] border-amber-500/20 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* 3. Energy Flow Lines (Connecting Stars) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <motion.path
                        d="M 32 32 L 128 128 L 224 224"
                        stroke="url(#grad1)"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                            <stop offset="50%" stopColor="#d97706" stopOpacity="1" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* 4. The 9 Stars */}
                {stars.map((star, i) => (
                    <motion.div
                        key={star.id}
                        className={`absolute flex items-center justify-center rounded-full shadow-sm backdrop-blur-sm
                            ${star.main ? 'w-12 h-12 z-20 border-2 border-amber-200' : 'w-8 h-8 z-10 border border-white/50'}
                            ${star.bg}
                        `}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: 1,
                            scale: [1, 1.1, 1], // Breathing effect
                            x: star.x,
                            y: star.y,
                        }}
                        transition={{
                            duration: 2,
                            delay: i * 0.1,
                            ease: "easeInOut", // FIXED: Changed from 'spring' to 'easeInOut' to support keyframe arrays
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <span className={`${star.main ? 'text-amber-700 text-lg' : `${star.color} text-sm`} font-serif font-bold`}>
                            {star.id}
                        </span>
                        {/* Star Sparkle */}
                        {star.main && (
                            <motion.div
                                className="absolute -inset-1 bg-amber-400/30 rounded-full blur-md"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* 5. Dynamic Text Message */}
            <div className="text-center h-24 max-w-md w-full relative z-30">
                <motion.div
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <h3 className="text-2xl md:text-3xl font-bold font-display bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 bg-clip-text text-transparent mb-3 tracking-wide">
                        {messages[messageIndex]}
                    </h3>
                    <div className="nav-line w-16 h-1 bg-amber-500/30 rounded-full mb-3" />
                </motion.div>

                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                    大模型正在深度计算，预计需要 1-2 分钟...
                </p>

                {/* Progress Indicator */}
                <div className="mt-6 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[200px] mx-auto">
                    <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FengShuiLoading;
