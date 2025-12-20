import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend
} from 'recharts';

type Props = {
    data: Array<{
        subject: string;
        A: number; // Before
        B: number; // After
        fullMark: number;
    }>;
};

const EnergyRadarChart: React.FC<Props> = ({ data }) => {
    return (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />

                    {/* Before - Gray/Subtle */}
                    <Radar
                        name="调整前"
                        dataKey="A"
                        stroke="#9ca3af"
                        strokeWidth={2}
                        fill="#9ca3af"
                        fillOpacity={0.3}
                    />

                    {/* After - Warm/Vibrant */}
                    <Radar
                        name="调整后"
                        dataKey="B"
                        stroke="#f59e0b" // Amber-500
                        strokeWidth={3}
                        fill="#f59e0b"
                        fillOpacity={0.5}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EnergyRadarChart;
