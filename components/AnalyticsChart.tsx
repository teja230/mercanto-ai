
import React, { useEffect, useRef } from 'react';

interface ChartData {
    type: 'line' | 'bar' | 'pie';
    title: string;
    labels: string[];
    datasets: {
        label: string;
        data: number[];
    }[];
}

interface AnalyticsChartProps {
    data: ChartData;
    theme: 'light' | 'dark';
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, theme }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        // Clean up previous instance
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        // Determine colors based on theme
        const isDark = theme === 'dark';
        const textColor = isDark ? '#94a3b8' : '#475569'; // slate-400 vs slate-600
        const gridColor = isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(203, 213, 225, 0.5)'; // slate-700/30 vs slate-300/50
        const titleColor = isDark ? '#22d3ee' : '#0284c7'; // cyan-400 vs brand-600
        const tooltipBg = isDark ? '#1e293b' : '#ffffff';
        const tooltipText = isDark ? '#f8fafc' : '#1e293b';
        const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

        // Define theme colors for data
        const colors = [
            'rgba(14, 165, 233, 0.7)', // sky-500
            'rgba(59, 130, 246, 0.7)', // blue-500
            'rgba(168, 85, 247, 0.7)', // purple-500
            'rgba(236, 72, 153, 0.7)', // pink-500
        ];

        const borderColors = [
            'rgb(14, 165, 233)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(236, 72, 153)',
        ];

        const config = {
            type: data.type,
            data: {
                labels: data.labels,
                datasets: data.datasets.map((ds, i) => ({
                    ...ds,
                    backgroundColor: data.type === 'pie' ? colors : colors[i % colors.length],
                    borderColor: data.type === 'pie' ? borderColors : borderColors[i % borderColors.length],
                    borderWidth: 2,
                    tension: 0.4, // Smooth lines
                    fill: data.type === 'line',
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    title: {
                        display: true,
                        text: data.title,
                        color: titleColor,
                        font: { size: 16, weight: 'bold' },
                        padding: 20
                    },
                    tooltip: {
                        backgroundColor: tooltipBg,
                        titleColor: tooltipText,
                        bodyColor: tooltipText,
                        borderColor: tooltipBorder,
                        borderWidth: 1,
                        padding: 10,
                        displayColors: true,
                    }
                },
                scales: data.type !== 'pie' ? {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                } : {}
            }
        };

        // @ts-ignore - Chart is loaded globally via CDN
        chartInstance.current = new window.Chart(ctx, config);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, theme]); // Re-render when theme changes

    return (
        <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl p-4 my-4 h-[300px] w-full shadow-inner transition-colors duration-300">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default AnalyticsChart;
