import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { colors } from '../../styles/colors';
import Card from '../common/Card';

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 16px;
`;

const TooltipContainer = styled.div`
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  border: 1px solid ${colors.border.light};
`;

const TooltipLabel = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: ${colors.text.primary};
`;

const TooltipValue = styled.div`
  color: ${colors.text.secondary};
  font-size: 14px;
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <TooltipLabel>{label}</TooltipLabel>
        {payload.map((entry, index) => (
          <TooltipValue key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)} {entry.unit || 'lt'}
          </TooltipValue>
        ))}
      </TooltipContainer>
    );
  }
  return null;
};

const PerformansChart = ({ data, title, type = 'line', dataKey = 'toplam', xKey = '_id', color = colors.primary }) => {
  // Veri formatını düzenle
  const formattedData = data.map(item => ({
    tarih: item[xKey],
    deger: item[dataKey] || 0,
    ...item
  }));

  return (
    <Card title={title} headerBorder>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
              <XAxis
                dataKey="tarih"
                stroke={colors.text.light}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={colors.text.light}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="deger"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                name="Süt Üretimi"
                unit=" lt"
              />
            </AreaChart>
          ) : (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
              <XAxis
                dataKey="tarih"
                stroke={colors.text.light}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={colors.text.light}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="deger"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
                name="Süt Üretimi"
                unit=" lt"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
};

export default PerformansChart;
