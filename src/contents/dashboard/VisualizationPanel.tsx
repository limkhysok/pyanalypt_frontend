// This file is used for the Dashboard.
// We will create a separate 'SampleCharts' for the landing page to avoid hydration/context issues.

import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";

export function VisualizationPanel() {
    // ... existing options ...
    const lineOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisLine: { lineStyle: { color: 'var(--muted-foreground)' } }, // Use CSS var
            axisLabel: { color: 'var(--muted-foreground)' }
        }],
        yAxis: [{
            type: 'value',
            splitLine: { lineStyle: { color: 'var(--border)' } },
            axisLabel: { color: 'var(--muted-foreground)' }
        }],
        series: [
            {
                name: 'Sales', type: 'line', stack: 'Total', smooth: true, lineStyle: { width: 0 }, showSymbol: false,
                areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#e4e4e7' }, { offset: 1, color: 'rgba(228, 228, 231, 0.01)' }]) },
                data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
                name: 'Traffic', type: 'line', stack: 'Total', smooth: true, lineStyle: { width: 0 }, showSymbol: false,
                areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#71717a' }, { offset: 1, color: 'rgba(113, 113, 122, 0.01)' }]) },
                data: [220, 182, 191, 234, 290, 330, 310]
            }
        ]
    };

    const barOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        xAxis: {
            type: 'category',
            data: ['Electronics', 'Clothing', 'Home', 'Books', 'Toys'],
            axisLine: { lineStyle: { color: 'var(--muted-foreground)' } },
            axisLabel: { color: 'var(--muted-foreground)' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'var(--border)' } },
            axisLabel: { color: 'var(--muted-foreground)' }
        },
        series: [{
            data: [120, 200, 150, 80, 70], type: 'bar',
            itemStyle: { borderRadius: [5, 5, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#fafafa' }, { offset: 1, color: '#52525b' }]) },
            showBackground: true,
            backgroundStyle: { color: 'rgba(255, 255, 255, 0.05)', borderRadius: [5, 5, 0, 0] }
        }]
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500">
            <TiltCard className="glass-card border-0" classNameContent="p-0">
                <CardHeader>
                    <CardTitle>Growth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReactECharts option={lineOption} style={{ height: '300px', width: '100%' }} />
                </CardContent>
            </TiltCard>

            <TiltCard className="glass-card border-0" classNameContent="p-0">
                <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReactECharts option={barOption} style={{ height: '300px', width: '100%' }} />
                </CardContent>
            </TiltCard>



            <div className="lg:col-span-2 flex justify-center mt-4">
                <Button variant="outline" className="gap-2 rounded-full px-8 hover:bg-secondary/80 transition-colors" asChild>
                    <a href="/templates">
                        View All Templates <ArrowRight size={16} />
                    </a>
                </Button>
            </div>
        </div>
    );
}

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Export a dedicated component for the Landing Page that just shows the charts beautifully
export function LandingPageCharts() {
    // Reuse logic or simplify for landing page
    return <VisualizationPanel />
}
