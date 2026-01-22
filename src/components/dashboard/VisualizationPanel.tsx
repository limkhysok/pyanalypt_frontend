"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VisualizationPanel() {
    const lineOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLine: { lineStyle: { color: '#ffffff33' } },
                axisLabel: { color: '#94a3b8' }
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#ffffff11' } },
                axisLabel: { color: '#94a3b8' }
            }
        ],
        series: [
            {
                name: 'Sales',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: { width: 0 },
                showSymbol: false,
                areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#e4e4e7' }, { offset: 1, color: 'rgba(228, 228, 231, 0.01)' }]) },
                emphasis: { focus: 'series' },
                data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
                name: 'Traffic',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: { width: 0 },
                showSymbol: false,
                areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#71717a' }, { offset: 1, color: 'rgba(113, 113, 122, 0.01)' }]) },
                emphasis: { focus: 'series' },
                data: [220, 182, 191, 234, 290, 330, 310]
            }
        ]
    };

    const barOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item'
        },
        xAxis: {
            type: 'category',
            data: ['Electronics', 'Clothing', 'Home', 'Books', 'Toys'],
            axisLine: { lineStyle: { color: '#ffffff33' } },
            axisLabel: { color: '#94a3b8' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#ffffff11' } },
            axisLabel: { color: '#94a3b8' }
        },
        series: [
            {
                data: [120, 200, 150, 80, 70],
                type: 'bar',
                itemStyle: {
                    borderRadius: [5, 5, 0, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#fafafa' }, { offset: 1, color: '#52525b' }])
                },
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: [5, 5, 0, 0]
                }
            }
        ]
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500">
            <Card className="glass-card border-0">
                <CardHeader>
                    <CardTitle>Growth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReactECharts option={lineOption} style={{ height: '300px', width: '100%' }} />
                </CardContent>
            </Card>

            <Card className="glass-card border-0">
                <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReactECharts option={barOption} style={{ height: '300px', width: '100%' }} />
                </CardContent>
            </Card>

            <Card className="glass-card border-0 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Advanced Analysis</span>
                        <span className="text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded">Real-time</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-white/10 rounded-lg">
                        Scatter Plot Visualization Placeholder
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
