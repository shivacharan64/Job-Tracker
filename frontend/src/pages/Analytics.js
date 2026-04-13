import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../utils/api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const chartDefaults = { plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS_MAP = { Applied:'#4f8ef7', Interviewing:'#fbbf24', Offer:'#10b981', Accepted:'#14b8a6', Rejected:'#f43f5e', Bookmarked:'#7c3aed', Withdrawn:'#94a3b8' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get().then(res => setData(res.data.analytics)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!data) return null;

  const { statusBreakdown, topCompanies, monthlyTrend, summary, avgResponseTime } = data;

  const statusChart = {
    labels: statusBreakdown.map(s => s._id),
    datasets: [{ data: statusBreakdown.map(s => s.count), backgroundColor: statusBreakdown.map(s => STATUS_COLORS_MAP[s._id] || '#94a3b8'), borderWidth: 0 }]
  };

  const monthlyChart = {
    labels: monthlyTrend.map(m => `${MONTHS[m._id.month - 1]} ${m._id.year}`),
    datasets: [{ label: 'Applications', data: monthlyTrend.map(m => m.count), fill: true, borderColor: '#4f8ef7', backgroundColor: 'rgba(79,142,247,0.1)', tension: 0.4, pointBackgroundColor: '#4f8ef7' }]
  };

  const topCompaniesChart = {
    labels: (topCompanies || []).map(c => c._id),
    datasets: [{
      label: 'Applications',
      data: (topCompanies || []).map(c => c.count),
      backgroundColor: 'rgba(79,142,247,0.7)',
      borderColor: '#4f8ef7',
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const successRate = summary.total > 0 ? Math.round((summary.offers / summary.total) * 100) : 0;
  const interviewRate = summary.total > 0 ? Math.round(((summary.interviews + summary.offers) / summary.total) * 100) : 0;

  return (
    <div>
      <div className="page-header"><h1>Reports & Analytics</h1><p>Insights into your job search performance</p></div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Applied', value: summary.total, color: '#4f8ef7' },
          { label: 'Interview Rate', value: `${interviewRate}%`, color: '#fbbf24' },
          { label: 'Offer Rate', value: `${successRate}%`, color: '#10b981' },
          { label: 'Avg. Response', value: `${avgResponseTime}d`, color: '#7c3aed' },
          { label: 'Rejected', value: summary.rejected, color: '#f43f5e' },
        ].map((kpi, i) => (
          <div key={i} className="stat-card" style={{ borderLeft: `4px solid ${kpi.color}` }}>
            <div className="stat-number" style={{ color: kpi.color, fontSize: 28 }}>{kpi.value}</div>
            <div className="stat-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Monthly Trend */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Applications Over Time</h3>
          {monthlyTrend.length > 0
            ? <Line data={monthlyChart} options={{ ...chartDefaults, responsive: true, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
            : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>}
        </div>

        {/* Status Donut */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Status Distribution</h3>
          {statusBreakdown.length > 0 ? (
            <div style={{ maxWidth: 300, margin: '0 auto' }}>
              <Doughnut data={statusChart} options={{ cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12 } } } }} />
            </div>
          ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top Companies — replaces Applications by Source */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Top Companies Applied To</h3>
          {topCompanies && topCompanies.length > 0
            ? <Bar data={topCompaniesChart} options={{ ...chartDefaults, responsive: true, indexAxis: 'y', plugins: { legend: { display: false } } }} />
            : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>}
        </div>

        {/* Performance Funnel */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Performance Funnel</h3>
          {[
            { label: 'Applications Sent', count: summary.total, pct: 100, color: '#4f8ef7' },
            { label: 'Got Interview', count: summary.interviews + summary.offers, pct: interviewRate, color: '#fbbf24' },
            { label: 'Received Offer', count: summary.offers, pct: successRate, color: '#10b981' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.count} ({item.pct}%)</span>
              </div>
              <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 5, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}