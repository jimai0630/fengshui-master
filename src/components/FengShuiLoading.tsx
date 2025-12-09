import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FengShuiLoadingProp = () => {
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

    // 9-Star Positions based on Luoshu (Magic Square) or a spiral
    // 4 9 2
    // 3 5 7
    // 8 1 6
    // We can animate them floating or flowing.
    const stars = [
        { id: 1, color: "text-blue-500", x: 0, y: 20 },
        { id: 2, color: "text-gray-800", x: 20, y: -20 },
        { id: 3, color: "text-emerald-500", x: -20, y: 0 },
        { id: 4, color: "text-emerald-600", x: -20, y: -20 },
        { id: 5, color: "text-amber-500", x: 0, y: 0, main: true },
        { id: 6, color: "text-gray-600", x: 20, y: 20 },
        { id: 7, color: "text-rose-500", x: 20, y: 0 },
        { id: 8, color: "text-amber-100", x: -20, y: 20 },
        { id: 9, color: "text-purple-500", x: 0, y: -20 },
    ];

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Animation Container */}
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                {/* Background Glow */}
                <motion.div
                    className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Central Tai Chi / Compass Graphic (Optional, or just the stars) */}
                <div className="absolute w-full h-full border-2 border-amber-900/10 rounded-full animate-spin-slow-reverse opacity-30"></div>

                {/* 9 Stars Animation */}
                {stars.map((star, i) => (
                    <motion.div
                        key={star.id}
                        className={`absolute ${star.main ? 'w-6 h-6 z-10' : 'w-4 h-4'} rounded-full shadow-lg flex items-center justify-center`}
                        style={{
                            background: star.main ? 'radial-gradient(circle, #f59e0b, #d97706)' : 'white',
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: 1,
                            scale: [1, 1.2, 1],
                            x: star.main ? 0 : Math.cos(i * (Math.PI * 2 / 8)) * 60,
                            y: star.main ? 0 : Math.sin(i * (Math.PI * 2 / 8)) * 60,
                            rotate: [0, 360]
                        }}
                        transition={{
                            duration: 0.8,
                            delay: i * 0.1,
                            type: "spring",
                            rotate: {
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }
                        }}
                    >
                        {/* Star Icon or Dot */}
                        <span className={`${star.main ? 'text-white' : star.color} font-bold text-xs`}>
                            {star.main ? '✦' : '★'}
                        </span>
                    </motion.div>
                ))}

                {/* Connecting Lines (Energy Flow) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 transform rotate-45">
                    <motion.path
                        d="M 24 24 L 72 72 L 120 120" // Simple cross example
                        stroke="url(#grad1)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 0 }} />
                            <stop offset="50%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0 }} />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Text Message */}
            <div className="text-center h-16">
                <motion.h3
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent mb-2"
                >
                    {messages[messageIndex]}
                </motion.h3>
                <p className="text-gray-400 text-sm">
                    大模型正在深度计算，预计需要 1-2 分钟...
                </p>
            </div>
        </div>
    );
};

export default FengShuiLoadingProp;
