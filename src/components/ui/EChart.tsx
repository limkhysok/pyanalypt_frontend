"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as echarts from 'echarts';

interface EChartProps {
    option: any;
    theme?: string | object;
    style?: React.CSSProperties;
    className?: string;
}

export interface EChartInstance {
    getEchartsInstance: () => echarts.ECharts | null;
}

const EChart = forwardRef<EChartInstance, EChartProps>(({ option, theme, style, className }, ref) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useImperativeHandle(ref, () => ({
        getEchartsInstance: () => chartInstance.current
    }));

    useEffect(() => {
        if (!chartRef.current) return;

        // Optimized Init/Update
        if (!chartInstance.current || chartInstance.current.isDisposed()) {
            // Check if there is an existing instance attached to this DOM
            const existingInstance = echarts.getInstanceByDom(chartRef.current);
            if (existingInstance && !existingInstance.isDisposed()) {
                chartInstance.current = existingInstance;
            } else {
                chartInstance.current = echarts.init(chartRef.current, theme);
            }
        }

        // Apply options - ensuring it's not disposed
        if (chartInstance.current && !chartInstance.current.isDisposed()) {
            chartInstance.current.setOption(option, true);
        }

        const handleResize = () => {
            chartInstance.current?.resize();
        };

        globalThis.addEventListener('resize', handleResize);

        return () => {
            globalThis.removeEventListener('resize', handleResize);
        };
    }, [option, theme]);

    // Full cleanup on unmount only
    useEffect(() => {
        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, []);

    return (
        <div 
            ref={chartRef} 
            style={{ width: '100%', height: '300px', ...style }} 
            className={className} 
        />
    );
});

EChart.displayName = 'EChart';

export default EChart;
