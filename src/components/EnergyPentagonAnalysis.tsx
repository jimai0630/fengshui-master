import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { EnergySummaryResponse } from '../types/dify';

type DimensionKey = 'love' | 'wealth' | 'career' | 'health' | 'luck';

type Props = {
    energyData: EnergySummaryResponse;
    dimensions: ReadonlyArray<DimensionKey>;
    icons: Record<string, React.ReactNode>;
};

const EnergyPentagonAnalysis: React.FC<Props> = ({ energyData, dimensions, icons }) => {
    const [activeDim, setActiveDim] = useState<DimensionKey>(dimensions[0]);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-rotation effect
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isPaused) {
                setActiveDim(current => {
                    const currentIndex = dimensions.indexOf(current);
                    const nextIndex = (currentIndex + 1) % dimensions.length;
                    return dimensions[nextIndex];
                });
            }
        }, 5000);

        return () => clearInterval(timer);
    }, [dimensions, isPaused]);

    const handleHover = (dim: string | null) => {
        if (dim) setActiveDim(dim as DimensionKey);
    };

    // Chart Config
    const size = 300;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.35;

    // Helper to get coordinates
    const getPoint = (value: number, index: number, max: number = 10) => {
        const finalAngle = (index * 2 * Math.PI / 5) - (Math.PI / 2);
        const r = (value / max) * radius;
        return {
            x: cx + r * Math.cos(finalAngle),
            y: cy + r * Math.sin(finalAngle)
        };
    };

    // Generate Polygon Points Path
    const makePath = (scores: Record<string, number>) => {
        return dimensions.map((dim, i) => {
            const { x, y } = getPoint(scores[dim], i);
            return `${x},${y}`;
        }).join(' ');
    };

    const beforePoints = useMemo(() => makePath(energyData.scores_before), [energyData, dimensions]);
    const afterPoints = useMemo(() => makePath(energyData.scores_after), [energyData, dimensions]);

    const activeData = energyData.summary_text[activeDim];
    const activeLabel = energyData.dimension_labels[activeDim];
    const activeScoreBefore = energyData.scores_before[activeDim];
    const activeScoreAfter = energyData.scores_after[activeDim];

    return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-8 items-center h-full">

            {/* Left: Visualization (40-50%) */}
            <div
                className="relative w-full md:w-1/2 flex justify-center items-center aspect-square md:aspect-auto h-[300px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                    {/* Grid Levels */}
                    {[2, 4, 6, 8, 10].map((level) => (
                        <polygon
                            key={level}
                            points={dimensions.map((_, i) => {
                                const { x, y } = getPoint(level, i);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            className="dark:stroke-gray-600"
                        />
                    ))}

                    {/* Axes */}
                    {dimensions.map((_, i) => {
                        const start = getPoint(0, i);
                        const end = getPoint(10, i);
                        return (
                            <line
                                key={`axis-${i}`}
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                                className="dark:stroke-gray-600"
                            />
                        );
                    })}

                    {/* Before Data Path */}
                    <motion.polygon
                        points={beforePoints}
                        fill="#9ca3af"
                        fillOpacity="0.15"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    />

                    {/* After Data Path */}
                    <motion.polygon
                        points={afterPoints}
                        fill="#f59e0b"
                        fillOpacity="0.3"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    />

                    {/* Interactive Vertices & Labels */}
                    {dimensions.map((dim, i) => {
                        const point = getPoint(11.5, i);
                        const vertex = getPoint(10, i);
                        const isActive = activeDim === dim;
                        const label = energyData.dimension_labels[dim];

                        return (
                            <g
                                key={dim}
                                onMouseEnter={() => handleHover(dim)}
                                className="cursor-pointer group"
                            >
                                {/* Invisible Hit Area */}
                                <circle cx={vertex.x} cy={vertex.y} r="30" fill="transparent" />

                                {/* Active Vertex Indicator */}
                                {isActive && (
                                    <circle
                                        cx={vertex.x}
                                        cy={vertex.y}
                                        r="4"
                                        fill="#f59e0b"
                                        className="animate-pulse"
                                    />
                                )}

                                {/* Text Label */}
                                <foreignObject x={point.x - 30} y={point.y - 14} width="60" height="28" className="overflow-visible">
                                    <div className="flex items-center justify-center transition-all duration-300">
                                        <span className={`
                                            px-2 py-1 rounded-md text-sm font-bold whitespace-nowrap shadow-sm
                                            transition-all duration-300
                                            ${isActive
                                                ? 'bg-amber-500 text-white scale-110 shadow-md'
                                                : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:text-amber-600'}
                                        `}>
                                            {label}
                                        </span>
                                    </div>
                                </foreignObject>
                            </g>
                        );
                    })}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <svg width="32" height="2" className="opacity-60">
                            <line x1="0" y1="1" x2="32" y2="1" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4 2" />
                        </svg>
                        <span className="text-gray-500 dark:text-gray-400">调整前</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-[2.5px] bg-amber-500"></div>
                        <span className="text-amber-600 dark:text-amber-400">调整后</span>
                    </div>
                </div>
            </div>

            {/* Right: Text Content (50-60%) */}
            <div className="w-full md:w-1/2 flex flex-col justify-center min-h-[200px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeDim}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                {React.isValidElement(icons[activeDim])
                                    ? React.cloneElement(icons[activeDim] as React.ReactElement<any>, { className: "w-6 h-6" })
                                    : icons[activeDim]}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {activeLabel}
                                </h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">指数提升:</span>
                                    <span className="font-semibold text-gray-500">{activeScoreBefore}</span>
                                    <ArrowRight className="w-3 h-3 text-amber-500" />
                                    <span className="font-bold text-amber-600 dark:text-amber-400 text-lg">
                                        {activeScoreAfter}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-300 to-transparent rounded-full opacity-50"></div>
                            <p className="pl-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {activeData}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EnergyPentagonAnalysis;
