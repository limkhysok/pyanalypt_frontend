import React from 'react';
import { 
    Sliders, 
    BarChart3, 
    Loader2,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import ReactECharts from 'echarts-for-react';
import 'echarts-gl';
import { VisualizeResponse, DatasetPreview, ChartType } from "@/types/project";

interface VisualizationForgeProps {
    selectedDatasetId: number | string | null;
    previewData: DatasetPreview | null;
    chartData: VisualizeResponse | null;
    isVisualizing: boolean;
    handleVisualize: () => void;
    visualizationKey: number;
    
    // State & Setters
    chartType: ChartType;
    setChartType: React.Dispatch<React.SetStateAction<ChartType>>;
    vXAxis: string;
    setVXAxis: React.Dispatch<React.SetStateAction<string>>;
    vYAxis: string;
    setVYAxis: React.Dispatch<React.SetStateAction<string>>;
    vCategoryCol: string;
    setVCategoryCol: React.Dispatch<React.SetStateAction<string>>;
}

export const VisualizationForge: React.FC<VisualizationForgeProps> = (props) => {
    const {
        selectedDatasetId,
        previewData,
        chartData,
        isVisualizing,
        handleVisualize,
        visualizationKey,
        chartType,
        setChartType,
        vXAxis,
        setVXAxis,
        vYAxis,
        setVYAxis,
        vCategoryCol,
        setVCategoryCol
    } = props;

    const getChartOption = () => {
        if (!chartData?.series) return {};

        const is3D = chartType?.includes('3D'); // Lucide icon uses 3D uppercase or chartType if normalized
        const isPie = chartType === 'pie';

        let type: string = chartType;
        if (is3D) {
            type = chartType.replace('3D', '').replace('3d', '').toLowerCase();
        } else if (chartType === 'stacked_bar') {
            type = 'bar';
        }

        const option: any = {
            backgroundColor: 'transparent',
            tooltip: { trigger: isPie ? 'item' : 'axis' },
            legend: { top: '5%', textStyle: { color: '#666', fontSize: 10 } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            series: chartData.series.map((s: any) => {
                const baseSeries: any = {
                    name: s.name || 'Series',
                    type: type,
                    data: s.data || s,
                    ...s
                };

                if (isPie) {
                    baseSeries.radius = ['40%', '75%'];
                    baseSeries.itemStyle = { borderRadius: 12, borderColor: '#fff', borderWidth: 2 };
                    baseSeries.label = { show: true, fontSize: 10, fontWeight: 'bold' };
                }

                if (chartType === 'line') baseSeries.smooth = true;

                return baseSeries;
            })
        };

        if (chartData.xAxis) {
            option.xAxis = { type: 'category', data: chartData.xAxis, name: vXAxis };
        }

        if (is3D) {
            option.xAxis3D = { type: 'value', name: vXAxis };
            option.yAxis3D = { type: 'value', name: vYAxis };
            option.zAxis3D = { type: 'value', name: 'Z' };
            option.grid3D = {
                viewControl: { autoRotate: true },
                postEffect: { enable: true },
                light: { main: { intensity: 1.2 } }
            };
        } else if (!isPie) {
            if (!option.xAxis) option.xAxis = { type: 'category', name: vXAxis };
            option.yAxis = { type: 'value', name: vYAxis };
        }

        return option;
    };

    if (!selectedDatasetId) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <Sliders className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-bold text-foreground/50">Select a dataset to begin visualization</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-10">
            {/* Control Panel */}
            <Card className="border-border/60 shadow-sm overflow-hidden h-fit">
                <CardHeader className="bg-muted/20 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Sliders className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-bold">Chart Composer</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Chart Type</Label>
                        <select 
                            value={chartType} 
                            onChange={(e) => setChartType(e.target.value as ChartType)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="scatter">Scatter Plot</option>
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="pie">Pie Chart</option>
                            <option value="scatter3d">3D Scatter</option>
                            <option value="stacked_bar">Stacked Bar</option>
                        </select>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-muted-foreground/40">X-Axis Column</Label>
                            <select 
                                value={vXAxis} 
                                onChange={(e) => setVXAxis(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">Select column</option>
                                {previewData?.columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>

                        {chartType !== 'pie' && (
                            <div className="space-y-2">
                                <Label className="text-[9px] font-bold text-muted-foreground/40">Y-Axis Column</Label>
                                <select 
                                    value={vYAxis} 
                                    onChange={(e) => setVYAxis(e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="">Select column</option>
                                    {previewData?.columns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-muted-foreground/40">Category / Color</Label>
                            <select 
                                value={vCategoryCol} 
                                onChange={(e) => setVCategoryCol(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="none">None</option>
                                {previewData?.columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Button 
                        className="w-full h-11 font-black uppercase tracking-widest gap-3"
                        onClick={handleVisualize}
                        disabled={isVisualizing}
                    >
                        {isVisualizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Render View
                    </Button>
                </CardContent>
            </Card>

            {/* Display Panel */}
            <Card className="border-border/60 shadow-sm overflow-hidden min-h-[500px] flex flex-col bg-background/50 backdrop-blur-sm relative">
                {isVisualizing && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Calculating…</p>
                        </div>
                    </div>
                )}

                {chartData ? (
                    <div className="flex-1 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                    {chartType.replace('_', ' ')} Analysis
                                    <Badge variant="outline" className="text-[9px] uppercase font-black h-5 px-2 bg-emerald-500/5 text-emerald-600 border-emerald-500/20">Active</Badge>
                                </h3>
                                <p className="text-xs text-muted-foreground/60 font-medium">Mapped {vXAxis} to {vYAxis ||'count'}</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[450px]">
                            <ReactECharts 
                                key={visualizationKey}
                                option={getChartOption()} 
                                style={{ height: '100%', width: '100%' }}
                                opts={{ renderer: 'canvas' }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-4">
                        <div className="p-6 bg-muted/40 rounded-3xl text-muted-foreground/30 border border-border/40">
                            <BarChart3 className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground/60">Vision Forge Ready</p>
                            <p className="text-xs text-muted-foreground/40 max-w-xs mx-auto">Configure the axes and color mapping on the left to generate insights.</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
