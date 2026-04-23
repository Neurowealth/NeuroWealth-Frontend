// Mock data for chart examples
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

// Line/Area chart data: Portfolio value over time
export const portfolioValueData: ChartDataPoint[] = [
  { name: "Jan", value: 10000, yield: 120 },
  { name: "Feb", value: 10500, yield: 150 },
  { name: "Mar", value: 10200, yield: 80 },
  { name: "Apr", value: 10800, yield: 200 },
  { name: "May", value: 11500, yield: 300 },
  { name: "Jun", value: 12000, yield: 250 },
  { name: "Jul", value: 12500, yield: 400 },
  { name: "Aug", value: 13000, yield: 350 },
  { name: "Sep", value: 13500, yield: 300 },
  { name: "Oct", value: 14200, yield: 450 },
  { name: "Nov", value: 14800, yield: 380 },
  { name: "Dec", value: 15200, yield: 320 },
];

// Bar chart data: Monthly yield
export const monthlyYieldData: ChartDataPoint[] = [
  { name: "Jan", value: 120 },
  { name: "Feb", value: 150 },
  { name: "Mar", value: 80 },
  { name: "Apr", value: 200 },
  { name: "May", value: 300 },
  { name: "Jun", value: 250 },
  { name: "Jul", value: 400 },
  { name: "Aug", value: 350 },
  { name: "Sep", value: 300 },
  { name: "Oct", value: 450 },
  { name: "Nov", value: 380 },
  { name: "Dec", value: 320 },
];

// Donut chart data: Asset allocation
export const assetAllocationData: ChartDataPoint[] = [
  { name: "USDC", value: 40, tone: "primary" },
  { name: "USDT", value: 25, tone: "accent" },
  { name: "XLM", value: 20, tone: "warning" },
  { name: "Other", value: 15, tone: "neutral-strong" },
];

// Time series data for multiple lines
export const multiLineData = [
  { name: "Jan", portfolio: 10000, benchmark: 9800 },
  { name: "Feb", portfolio: 10500, benchmark: 10100 },
  { name: "Mar", portfolio: 10200, benchmark: 9900 },
  { name: "Apr", portfolio: 10800, benchmark: 10300 },
  { name: "May", portfolio: 11500, benchmark: 10800 },
  { name: "Jun", portfolio: 12000, benchmark: 11200 },
  { name: "Jul", portfolio: 12500, benchmark: 11800 },
  { name: "Aug", portfolio: 13000, benchmark: 12300 },
  { name: "Sep", portfolio: 13500, benchmark: 12800 },
  { name: "Oct", portfolio: 14200, benchmark: 13500 },
  { name: "Nov", portfolio: 14800, benchmark: 14100 },
  { name: "Dec", portfolio: 15200, benchmark: 14600 },
];

// Categorical bar data
export const categoricalBarData: ChartDataPoint[] = [
  { name: "Deposits", value: 15000 },
  { name: "Withdrawals", value: 3000 },
  { name: "Yield", value: 2800 },
  { name: "Fees", value: 200 },
];
