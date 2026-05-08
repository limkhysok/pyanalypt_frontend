import { 
    Activity, Share2, BarChart3, SquareStack, LayoutGrid, BoxSelect, CircleDot, 
    TrendingUp, Calendar, Cpu, Circle, Network, Layers, Hexagon, GitBranch, 
    GanttChartSquare, Grid3X3, LineChart, Spline, PieChart, Radar, Workflow, 
    Share, Waves, Sun, Maximize, Package, LucideIcon 
} from "lucide-react";

export interface ChartArchitecture {
    id: string;
    label: string;
    scenarios: string[];
    icon: LucideIcon;
    desc: string;
    skeleton: {
        type: 'json' | 'excel';
        content: string;
    };
}

export const SCENARIOS = [
    "All Scenarios", 
    "Correlations", 
    "Proportions", 
    "Networks", 
    "Distributions", 
    "Time Series", 
    "Hierarchies", 
    "Time Chunks"
];

export const VISUALIZATIONS_CATALOG: ChartArchitecture[] = [
    { 
        id: 'alluvial', 
        label: 'Alluvial Diagram', 
        scenarios: ['Correlations', 'Proportions'], 
        icon: Activity, 
        desc: 'Tracks flow between points and correlates categories.',
        skeleton: {
            type: 'json',
            content: '[\n  { "source": "A", "target": "B", "value": 10 },\n  { "source": "B", "target": "C", "value": 15 }\n]'
        }
    },
    { 
        id: 'arc', 
        label: 'Arc Diagram', 
        scenarios: ['Networks'], 
        icon: Share2, 
        desc: 'Visualizes network connections along a linear axis.',
        skeleton: {
            type: 'json',
            content: '[\n  { "source": "Node1", "target": "Node2" },\n  { "source": "Node2", "target": "Node3" }\n]'
        }
    },
    { 
        id: 'bar', 
        label: 'Bar Chart', 
        scenarios: ['Correlations'], 
        icon: BarChart3, 
        desc: 'Standard comparison of values across categories.',
        skeleton: {
            type: 'excel',
            content: 'Category | Value\nSales    | 450\nProfit   | 120'
        }
    },
    { id: 'multi_bar', label: 'Multi-set Bar Chart', scenarios: ['Correlations', 'Proportions'], icon: BarChart3, desc: 'Groups multiple dimensions within categorical bars.', skeleton: { type: 'excel', content: 'Dim1 | Dim2 | Value\nA | X | 100\nA | Y | 150' } },
    { id: 'stacked_bar', label: 'Stacked Bar Chart', scenarios: ['Correlations', 'Proportions'], icon: SquareStack, desc: 'Displays part-to-whole relationships across categories.', skeleton: { type: 'excel', content: 'Category | Subcat | Value\nOffice | Paper | 50\nOffice | Ink | 30' } },
    { id: 'beeswarm', label: 'Beeswarm Plot', scenarios: ['Distributions', 'Time Series', 'Proportions'], icon: LayoutGrid, desc: 'Densely packed points showing distribution without overlap.', skeleton: { type: 'json', content: '[\n  { "category": "A", "value": 10.5 },\n  { "category": "A", "value": 11.2 }\n]' } },
    { id: 'box', label: 'Box Plot', scenarios: ['Distributions'], icon: BoxSelect, desc: 'Five-number summary of distributions and outliers.', skeleton: { type: 'excel', content: 'Group | Value\nA | 10\nA | 12\nA | 15' } },
    { id: 'bubble', label: 'Bubble Chart', scenarios: ['Correlations', 'Proportions'], icon: CircleDot, desc: 'Adds a third magnitude dimension via circle size.', skeleton: { type: 'json', content: '[\n  { "x": 10, "y": 20, "z": 5 }\n]' } },
    { id: 'bump', label: 'Bumpchart', scenarios: ['Time Series', 'Correlations', 'Proportions'], icon: TrendingUp, desc: 'Tracks changes in rank over time.', skeleton: { type: 'excel', content: 'Date | Team | Rank\n2023-01 | A | 1\n2023-01 | B | 2' } },
    { id: 'calendar', label: 'Calendar Heatmap', scenarios: ['Time Chunks', 'Proportions'], icon: Calendar, desc: 'Shows temporal patterns across daily or monthly cycles.', skeleton: { type: 'excel', content: 'Date | Value\n2023-01-01 | 10\n2023-01-02 | 15' } },
    { id: 'chord', label: 'Chord Diagram', scenarios: ['Networks'], icon: Cpu, desc: 'Represents intersections and relationships in a circle.', skeleton: { type: 'json', content: '[[0, 10, 5], [10, 0, 8], [5, 8, 0]]' } },
    { id: 'circle_packing', label: 'Circle Packing', scenarios: ['Hierarchies', 'Proportions'], icon: Circle, desc: 'Nested circles for hierarchical proportion analysis.', skeleton: { type: 'json', content: '{ "name": "root", "children": [{ "name": "A", "value": 10 }] }' } },
    { id: 'circular_dendrogram', label: 'Circular Dendrogram', scenarios: ['Hierarchies', 'Proportions'], icon: Network, desc: 'Radial tree layout for complex hierarchies.', skeleton: { type: 'json', content: '{ "name": "root", "children": [{ "name": "A" }] }' } },
    { id: 'contour', label: 'Contour Plot', scenarios: ['Correlations', 'Distributions'], icon: Layers, desc: 'Topographical representation of 2D data density.', skeleton: { type: 'json', content: '[{ "x": 1, "y": 1, "v": 10 }]' } },
    { id: 'convex_hull', label: 'Convex Hull', scenarios: ['Correlations', 'Proportions'], icon: Hexagon, desc: 'Groups data points by their minimum boundary.', skeleton: { type: 'json', content: '[{ "x": 1, "y": 1 }]' } },
    { id: 'linear_dendrogram', label: 'Linear Dendrogram', scenarios: ['Hierarchies', 'Proportions'], icon: GitBranch, desc: 'Standard tree hierarchy mapping.', skeleton: { type: 'json', content: '{ "name": "root" }' } },
    { id: 'gantt', label: 'Gantt Chart', scenarios: ['Time Series', 'Correlations'], icon: GanttChartSquare, desc: 'Tracks project schedules and temporal intervals.', skeleton: { type: 'excel', content: 'Task | Start | End\nDev | 2023-01 | 2023-02' } },
    { id: 'hexbin', label: 'Hexagonal Binning', scenarios: ['Correlations', 'Distributions'], icon: Grid3X3, desc: 'Aggregates point density into clean hexagons.', skeleton: { type: 'json', content: '[{ "x": 1, "y": 1 }]' } },
    { id: 'horizon', label: 'Horizon Graph', scenarios: ['Time Series', 'Correlations'], icon: Activity, desc: 'Compressed line plots for high-density time series.', skeleton: { type: 'excel', content: 'Date | Value\n2023-01-01 | 10' } },
    { id: 'line', label: 'Line Chart', scenarios: ['Time Series', 'Correlations'], icon: LineChart, desc: 'Classic visualization for trends over an axis.', skeleton: { type: 'excel', content: 'X | Y\n1 | 10\n2 | 15' } },
    { id: 'matrix', label: 'Matrix Plot', scenarios: ['Correlations', 'Time Series', 'Proportions'], icon: Grid3X3, desc: 'Grid representation of pairwise relationships.', skeleton: { type: 'json', content: '[[1, 0], [0, 1]]' } },
    { id: 'parallel', label: 'Parallel Coordinates', scenarios: ['Correlations', 'Distributions'], icon: Spline, desc: 'Visualizes high-dimensional data along parallel axes.', skeleton: { type: 'json', content: '[{ "A": 10, "B": 5, "C": 8 }]' } },
    { id: 'pie', label: 'Pie Chart', scenarios: ['Proportions'], icon: PieChart, desc: 'Simple representation of static part-to-whole ratios.', skeleton: { type: 'excel', content: 'Label | Value\nA | 30\nB | 70' } },
    { id: 'radar', label: 'Radar Chart', scenarios: ['Correlations'], icon: Radar, desc: 'Compares multiple quantitative variables.', skeleton: { type: 'json', content: '[{ "axis": "A", "value": 10 }]' } },
    { id: 'sankey', label: 'Sankey Diagram', scenarios: ['Networks'], icon: Workflow, desc: 'Models energy or information flows across nodes.', skeleton: { type: 'json', content: '{ "nodes": [], "links": [] }' } },
    { id: 'slope', label: 'Slope Chart', scenarios: ['Correlations'], icon: Share, desc: 'Focuses on the change between two discrete points.', skeleton: { type: 'excel', content: 'Point | Year1 | Year2\nA | 10 | 20' } },
    { id: 'stream', label: 'Streamgraph', scenarios: ['Time Series', 'Correlations', 'Proportions'], icon: Waves, desc: 'Organic area chart centered around a baseline.', skeleton: { type: 'excel', content: 'Date | Category | Value\n2023-01 | A | 10' } },
    { id: 'sunburst', label: 'Sunburst Diagram', scenarios: ['Hierarchies', 'Proportions'], icon: Sun, desc: 'Multi-level ring structure for hierarchies.', skeleton: { type: 'json', content: '{ "name": "root" }' } },
    { id: 'treemap', label: 'Treemap', scenarios: ['Hierarchies', 'Proportions'], icon: LayoutGrid, desc: 'Uses rectangles to represent quantitative hierarchies.', skeleton: { type: 'json', content: '{ "name": "root" }' } },
    { id: 'violin', label: 'Violin Plot', scenarios: ['Distributions'], icon: Activity, desc: 'Combination of boxplot and kernel density plot.', skeleton: { type: 'json', content: '[{ "v": 10 }]' } },
    { id: 'voronoi', label: 'Voronoi Diagram', scenarios: ['Correlations'], icon: Package, desc: 'Partitions space based on distance to specific points.', skeleton: { type: 'json', content: '[{ "x": 1, "y": 1 }]' } },
    { id: 'voronoi_treemap', label: 'Treemap (Voronoi)', scenarios: ['Hierarchies', 'Proportions'], icon: Maximize, desc: 'Irregular polygons for hierarchical visualization.', skeleton: { type: 'json', content: '{ "name": "root" }' } },
];
