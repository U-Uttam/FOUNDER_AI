import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  CalendarCheck, 
  Scale, 
  Target,
  BarChart3
} from 'lucide-react';
import type { FinanceData } from '../types';

interface FinanceViewProps {
  financeData: FinanceData | undefined;
}

export default function FinanceView({ financeData }: FinanceViewProps) {
  if (!financeData) {
    return (
      <div className="p-8 text-center text-slate-400">
        No financial data generated.
      </div>
    );
  }

  const { budget_allocation, pricing_strategy, revenue_forecast, break_even, roi_percentage, payback_period_months, expense_analysis, cash_flow } = financeData;
  const expense_breakdown = (financeData as any).expense_breakdown as { item: string; monthly_cost: number }[] | undefined;
  const profit_estimation = (financeData as any).profit_estimation as { net_profit_margin_percentage: number; annual_net_profit_y1: number; annual_net_profit_y2: number; annual_net_profit_y3: number } | undefined;

  // Colors for donut chart categories
  const donutColors = ['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

  // Calculate donut chart slices
  let cumulativePercent = 0;
  const donutSlices = budget_allocation.map((cat, idx) => {
    const percent = cat.percentage / 100;
    const startAngle = cumulativePercent * 360;
    cumulativePercent += percent;
    const endAngle = cumulativePercent * 360;

    const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
      const rad = ((angleDeg - 90) * Math.PI) / 180.0;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const start = polarToCartesian(100, 100, 70, endAngle);
    const end = polarToCartesian(100, 100, 70, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const pathData = ['M', start.x, start.y, 'A', 70, 70, 0, largeArcFlag, 0, end.x, end.y].join(' ');

    return {
      path: pathData,
      color: donutColors[idx % donutColors.length],
      category: cat.category,
      percentage: cat.percentage,
      amount: cat.amount
    };
  });

  // Revenue forecast line graph
  const forecastValues = [revenue_forecast.year_1, revenue_forecast.year_2, revenue_forecast.year_3];
  const maxVal = Math.max(...forecastValues) * 1.15;
  const graphPoints = forecastValues.map((val, idx) => ({
    x: 60 + idx * 120,
    y: 140 - (val / maxVal) * 110,
    val
  }));
  const linePath = `M ${graphPoints[0].x} ${graphPoints[0].y} L ${graphPoints[1].x} ${graphPoints[1].y} L ${graphPoints[2].x} ${graphPoints[2].y}`;
  const areaPath = `${linePath} L ${graphPoints[2].x} 150 L ${graphPoints[0].x} 150 Z`;

  // Dynamic expense bar widths from expense_breakdown or expense_analysis
  const expenseItems: { label: string; amount: number; color: string }[] = [];
  if (expense_breakdown && expense_breakdown.length > 0) {
    expense_breakdown.forEach((e, i) => {
      expenseItems.push({
        label: e.item,
        amount: e.monthly_cost,
        color: donutColors[i % donutColors.length]
      });
    });
  } else {
    const expenseArr = [
      { label: 'Lease / Rent', amount: expense_analysis.rent_monthly, color: '#4f46e5' },
      { label: 'Staff Salaries', amount: expense_analysis.salaries_monthly, color: '#10b981' },
      { label: 'Raw Materials', amount: expense_analysis.ingredients_monthly, color: '#ef4444' },
      { label: 'Utilities & Marketing', amount: expense_analysis.marketing_utilities_monthly, color: '#f59e0b' },
    ];
    expenseArr.forEach(e => expenseItems.push(e));
  }
  const maxExpenseAmount = Math.max(...expenseItems.map(e => e.amount));

  // Profit margin arc SVG helper
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-slate-800 dark:text-slate-100">
          Financial Planning & Projections
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Capital allocations, break-even operations, 3-year growth lines, and 6-month cashflow sheets.
        </p>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ROI */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#d1fae5" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26 * Math.min(roi_percentage, 100) / 100} 999`}
                transform="rotate(-90 32 32)"
              />
              <text x="32" y="37" textAnchor="middle" className="fill-emerald-600 font-black text-[10px]" style={{ fontSize: '10px', fontWeight: 900 }}>
                {roi_percentage}%
              </text>
            </svg>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Projected ROI</span>
            <span className="text-lg font-extrabold font-outfit text-emerald-500">{roi_percentage}%</span>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 block">Return on Investment</span>
          </div>
        </div>

        {/* Payback period */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <CalendarCheck size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Payback Period</span>
            <span className="text-lg font-extrabold font-outfit text-slate-800 dark:text-slate-200">{payback_period_months} Months</span>
            <span className="text-[10px] text-indigo-500/70 block">To recover initial capital</span>
          </div>
        </div>

        {/* Pricing Strategy */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Scale size={24} />
          </div>
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Pricing Model</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block max-w-[200px]" title={pricing_strategy}>
              {pricing_strategy}
            </span>
          </div>
        </div>
      </div>

      {/* Donut Chart + Revenue Line Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Capital Budget Allocation Donut */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-[200px] h-[200px] flex-shrink-0">
            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
              {donutSlices.map((slice, idx) => (
                <path
                  key={idx}
                  d={slice.path}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="22"
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Budget</span>
              <span className="text-base font-extrabold font-outfit text-slate-800 dark:text-slate-200">
                ₹{budget_allocation.reduce((a, b) => a + b.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Capital Allocation</h3>
            <div className="space-y-2 text-xs">
              {donutSlices.map((slice, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="truncate max-w-[120px]">{slice.category}</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 ml-2">
                      {slice.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden ml-4">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${slice.percentage}%`, backgroundColor: slice.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Year Revenue Line Graph */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3-Year Revenue Curve</h3>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">Compound Expansion</span>
          </div>

          <div className="relative border-b border-l border-slate-200/50 dark:border-slate-800/40 ml-2 h-[170px]">
            <svg width="100%" height="100%" viewBox="0 0 360 170" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradFin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#areaGradFin)" />
              <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

              {graphPoints.map((point, idx) => (
                <g key={idx}>
                  <circle cx={point.x} cy={point.y} r="6" className="fill-white dark:fill-slate-950 stroke-indigo-600 stroke-2" />
                  <text x={point.x} y={point.y - 14} textAnchor="middle" fill="#4f46e5" fontSize="9" fontWeight="900" fontFamily="Outfit">
                    ₹{(point.val / 100000).toFixed(1)}L
                  </text>
                  <text x={point.x} y="165" textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8">
                    Year {idx + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Year-over-Year growth */}
          {forecastValues[0] > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Year 1', val: revenue_forecast.year_1, prev: null },
                { label: 'Year 2', val: revenue_forecast.year_2, prev: revenue_forecast.year_1 },
                { label: 'Year 3', val: revenue_forecast.year_3, prev: revenue_forecast.year_2 }
              ].map((yr, i) => {
                const growth = yr.prev ? (((yr.val - yr.prev) / yr.prev) * 100).toFixed(0) : null;
                return (
                  <div key={i} className="text-center p-2 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">{yr.label}</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">₹{(yr.val / 100000).toFixed(1)}L</span>
                    {growth && (
                      <span className="text-[9px] text-emerald-500 font-bold">▲ {growth}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Profit Estimation Cards (if available) */}
      {profit_estimation && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Target size={16} /> Net Profit Estimation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Year 1 Net Profit', val: profit_estimation.annual_net_profit_y1, color: '#10b981' },
              { label: 'Year 2 Net Profit', val: profit_estimation.annual_net_profit_y2, color: '#4f46e5' },
              { label: 'Year 3 Net Profit', val: profit_estimation.annual_net_profit_y3, color: '#7c3aed' }
            ].map((item, idx) => {
              const margin = profit_estimation.net_profit_margin_percentage;
              const startAngle = -130;
              const endAngle = startAngle + (margin / 100) * 260;
              return (
                <div key={idx} className="flex flex-col items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                  <svg width="80" height="50" viewBox="0 0 80 50">
                    <path
                      d={describeArc(40, 45, 32, -130, 130)}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d={describeArc(40, 45, 32, startAngle, Math.min(endAngle, 130))}
                      fill="none"
                      stroke={item.color}
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <text x="40" y="42" textAnchor="middle" fontSize="10" fontWeight="900" fill={item.color}>
                      {margin}%
                    </text>
                  </svg>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">{item.label}</span>
                    <span className="text-sm font-extrabold" style={{ color: item.color }}>
                      ₹{item.val.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Break-even & Expense Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Break-even */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Scale size={16} /> Monthly Break-Even Metrics
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Monthly Operating Overhead', val: `₹${break_even.monthly_fixed_costs.toLocaleString()}` },
              { label: 'Average Customer Ticket Size', val: `₹${break_even.average_order_value.toLocaleString()}` },
              { label: 'Variable Product Cost per Order', val: `₹${break_even.variable_cost_per_order.toLocaleString()}` },
            ].map((item, i) => (
              <div key={i} className="flex justify-between p-2.5 border-b border-slate-100 dark:border-slate-900">
                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                <span className="font-bold">{item.val}</span>
              </div>
            ))}
            <div className="flex justify-between p-2.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold">
              <span>Required Orders (Monthly)</span>
              <span>{Math.ceil(break_even.monthly_orders_needed)} Units</span>
            </div>
            <div className="flex justify-between p-2.5 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl">
              <span>Daily Target Transactions</span>
              <span>{Math.ceil(break_even.daily_orders_needed)} Orders / Day</span>
            </div>
          </div>
        </div>

        {/* Operating Expenses — dynamic */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart3 size={16} /> Monthly Operating Expenses
          </h3>
          <div className="space-y-4 pt-1">
            {expenseItems.map((item, idx) => {
              const widthPct = maxExpenseAmount > 0 ? (item.amount / maxExpenseAmount) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{item.label}</span>
                    <span className="font-bold">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6-Month Cash Flow Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <PiggyBank size={16} /> 6-Month Cash Flow Spreadsheets
        </h3>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-400 uppercase font-bold tracking-wider">
                <th className="p-4">Month</th>
                <th className="p-4 text-right">Inflow Revenue</th>
                <th className="p-4 text-right">Outflow Expenses</th>
                <th className="p-4 text-right">Net Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {cash_flow.map((row, idx) => {
                const isNetPositive = row.net >= 0;
                return (
                  <tr 
                    key={idx} 
                    className="border-b border-slate-100 dark:border-slate-900/60 last:border-b-0 hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition"
                  >
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{row.month}</td>
                    <td className="p-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                      ₹{row.inflow.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                      ₹{row.outflow.toLocaleString()}
                    </td>
                    <td className={`p-4 text-right font-extrabold ${isNetPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <span className="flex items-center justify-end gap-1.5">
                        {isNetPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        ₹{row.net.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
