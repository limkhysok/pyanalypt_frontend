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
    { id: 'alluvial', label: 'Alluvial Diagram', scenarios: ['Correlations', 'Proportions'], icon: Activity, desc: 'Tracks flow between points and correlates categories.' },
    { id: 'arc', label: 'Arc Diagram', scenarios: ['Networks'], icon: Share2, desc: 'Visualizes network connections along a linear axis.' },
    { id: 'bar', label: 'Bar Chart', scenarios: ['Correlations'], icon: BarChart3, desc: 'Standard comparison of values across categories.' },
    { id: 'multi_bar', label: 'Multi-set Bar Chart', scenarios: ['Correlations', 'Proportions'], icon: BarChart3, desc: 'Groups multiple dimensions within categorical bars.' },
    { id: 'stacked_bar', label: 'Stacked Bar Chart', scenarios: ['Correlations', 'Proportions'], icon: SquareStack, desc: 'Displays part-to-whole relationships across categories.' },
    { id: 'beeswarm', label: 'Beeswarm Plot', scenarios: ['Distributions', 'Time Series', 'Proportions'], icon: LayoutGrid, desc: 'Densely packed points showing distribution without overlap.' },
    { id: 'box', label: 'Box Plot', scenarios: ['Distributions'], icon: BoxSelect, desc: 'Five-number summary of distributions and outliers.' },
    { id: 'bubble', label: 'Bubble Chart', scenarios: ['Correlations', 'Proportions'], icon: CircleDot, desc: 'Adds a third magnitude dimension via circle size.' },
    { id: 'bump', label: 'Bumpchart', scenarios: ['Time Series', 'Correlations', 'Proportions'], icon: TrendingUp, desc: 'Tracks changes in rank over time.' },
    { id: 'calendar', label: 'Calendar Heatmap', scenarios: ['Time Chunks', 'Proportions'], icon: Calendar, desc: 'Shows temporal patterns across daily or monthly cycles.' },
    { id: 'chord', label: 'Chord Diagram', scenarios: ['Networks'], icon: Cpu, desc: 'Represents intersections and relationships in a circle.' },
    { id: 'circle_packing', label: 'Circle Packing', scenarios: ['Hierarchies', 'Proportions'], icon: Circle, desc: 'Nested circles for hierarchical proportion analysis.' },
    { id: 'circular_dendrogram', label: 'Circular Dendrogram', scenarios: ['Hierarchies', 'Proportions'], icon: Network, desc: 'Radial tree layout for complex hierarchies.' },
    { id: 'contour', label: 'Contour Plot', scenarios: ['Correlations', 'Distributions'], icon: Layers, desc: 'Topographical representation of 2D data density.' },
    { id: 'convex_hull', label: 'Convex Hull', scenarios: ['Correlations', 'Proportions'], icon: Hexagon, desc: 'Groups data points by their minimum boundary.' },
    { id: 'linear_dendrogram', label: 'Linear Dendrogram', scenarios: ['Hierarchies', 'Proportions'], icon: GitBranch, desc: 'Standard tree hierarchy mapping.' },
    { id: 'gantt', label: 'Gantt Chart', scenarios: ['Time Series', 'Correlations'], icon: GanttChartSquare, desc: 'Tracks project schedules and temporal intervals.' },
    { id: 'hexbin', label: 'Hexagonal Binning', scenarios: ['Correlations', 'Distributions'], icon: Grid3X3, desc: 'Aggregates point density into clean hexagons.' },
    { id: 'horizon', label: 'Horizon Graph', scenarios: ['Time Series', 'Correlations'], icon: Activity, desc: 'Compressed line plots for high-density time series.' },
    { id: 'line', label: 'Line Chart', scenarios: ['Time Series', 'Correlations'], icon: LineChart, desc: 'Classic visualization for trends over an axis.' },
    { id: 'matrix', label: 'Matrix Plot', scenarios: ['Correlations', 'Time Series', 'Proportions'], icon: Grid3X3, desc: 'Grid representation of pairwise relationships.' },
    { id: 'parallel', label: 'Parallel Coordinates', scenarios: ['Correlations', 'Distributions'], icon: Spline, desc: 'Visualizes high-dimensional data along parallel axes.' },
    { id: 'pie', label: 'Pie Chart', scenarios: ['Proportions'], icon: PieChart, desc: 'Simple representation of static part-to-whole ratios.' },
    { id: 'radar', label: 'Radar Chart', scenarios: ['Correlations'], icon: Radar, desc: 'Compares multiple quantitative variables.' },
    { id: 'sankey', label: 'Sankey Diagram', scenarios: ['Networks'], icon: Workflow, desc: 'Models energy or information flows across nodes.' },
    { id: 'slope', label: 'Slope Chart', scenarios: ['Correlations'], icon: Share, desc: 'Focuses on the change between two discrete points.' },
    { id: 'stream', label: 'Streamgraph', scenarios: ['Time Series', 'Correlations', 'Proportions'], icon: Waves, desc: 'Organic area chart centered around a baseline.' },
    { id: 'sunburst', label: 'Sunburst Diagram', scenarios: ['Hierarchies', 'Proportions'], icon: Sun, desc: 'Multi-level ring structure for hierarchies.' },
    { id: 'treemap', label: 'Treemap', scenarios: ['Hierarchies', 'Proportions'], icon: LayoutGrid, desc: 'Uses rectangles to represent quantitative hierarchies.' },
    { id: 'violin', label: 'Violin Plot', scenarios: ['Distributions'], icon: Activity, desc: 'Combination of boxplot and kernel density plot.' },
    { id: 'voronoi', label: 'Voronoi Diagram', scenarios: ['Correlations'], icon: Package, desc: 'Partitions space based on distance to specific points.' },
    { id: 'voronoi_treemap', label: 'Treemap (Voronoi)', scenarios: ['Hierarchies', 'Proportions'], icon: Maximize, desc: 'Irregular polygons for hierarchical visualization.' },
];
