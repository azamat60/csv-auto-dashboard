export type Primitive = string | number | boolean | null;
export type DataRow = Record<string, string>;

export type ColumnType = "number" | "date" | "string" | "boolean" | "id-like";

export type NumberStats = {
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  variance: number;
  missingCount: number;
};

export type DateStats = {
  minDate: string;
  maxDate: string;
  missingCount: number;
  parseSuccessRate: number;
};

export type StringStats = {
  uniqueCount: number;
  topValues: Array<{ value: string; count: number }>;
  missingCount: number;
};

export type BooleanStats = {
  trueCount: number;
  falseCount: number;
  missingCount: number;
};

export type ColumnMeta = {
  key: string;
  originalName: string;
  type: ColumnType;
  missingCount: number;
  uniquenessRatio: number;
  stats?: NumberStats | DateStats | StringStats | BooleanStats;
};

export type DateRange = {
  from?: string;
  to?: string;
};

export type NumericRange = {
  min?: number;
  max?: number;
};

export type FilterState = {
  search: string;
  dateColumn?: string;
  dateRange?: DateRange;
  categoryColumn?: string;
  categoryMode?: "all" | "custom" | "none";
  categoryValues: string[];
  numericColumn?: string;
  numericRange?: NumericRange;
  chartSelection?: {
    column: string;
    values: string[];
  };
};

export type AggType = "sum" | "avg" | "count" | "min" | "max";

export type GroupingConfig = {
  groupBy?: string;
  metric?: string;
  aggregation: AggType;
};

export type ChartType = "timeseries" | "bar" | "histogram" | "pie" | "scatter";

export type ChartSpec = {
  id: string;
  title: string;
  type: ChartType;
  xKey: string;
  yKey: string;
  data: Array<Record<string, string | number>>;
  interactiveFilterKey?: string;
};

export type SummarySpec = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type SortDirection = "asc" | "desc";

export type ViewConfig = {
  id: string;
  name: string;
  filters: FilterState;
  grouping: GroupingConfig;
  chartOrder: string[];
};

export type DatasetState = {
  name: string;
  headers: string[];
  rows: DataRow[];
  sample: DataRow[];
  metas: ColumnMeta[];
};
