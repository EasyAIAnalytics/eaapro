declare module 'react-heatmap-grid' {
  import React from 'react';

  export interface HeatmapGridProps {
    xLabels: string[];
    yLabels: string[];
    data: number[][];
    squares?: boolean;
    cellStyle?: (background: string, value: number, min: number, max: number, data: number[][], x: number, y: number) => React.CSSProperties;
    cellRender?: (value: number, x: number, y: number) => React.ReactNode;
    onClick?: (x: number, y: number) => void;
    onMouseEnter?: (x: number, y: number) => void;
    onMouseLeave?: (x: number, y: number) => void;
    background?: string;
    height?: number;
    width?: number;
    unit?: string;
    className?: string;
    style?: React.CSSProperties;
    xLabelsStyle?: React.CSSProperties;
    yLabelsStyle?: React.CSSProperties;
  }

  const HeatmapGrid: React.FC<HeatmapGridProps>;
  export default HeatmapGrid;
} 