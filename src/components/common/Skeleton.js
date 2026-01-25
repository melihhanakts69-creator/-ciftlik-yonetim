import React from 'react';
import styled, { keyframes } from 'styled-components';

// Shimmer animation
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${props => props.radius || '8px'};
`;

// Temel Skeleton türleri
export const SkeletonLine = styled(SkeletonBase)`
  height: ${props => props.height || '16px'};
  width: ${props => props.width || '100%'};
  margin-bottom: ${props => props.mb || '10px'};
`;

export const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 50%;
`;

export const SkeletonCard = styled(SkeletonBase)`
  width: 100%;
  height: ${props => props.height || '120px'};
  margin-bottom: ${props => props.mb || '15px'};
  border-radius: 16px;
`;

// Dashboard için hazır bileşenler
export const DashboardCardSkeleton = () => (
    <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginBottom: '20px'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <SkeletonCircle size="48px" />
            <div style={{ flex: 1 }}>
                <SkeletonLine width="60%" height="14px" mb="8px" />
                <SkeletonLine width="40%" height="24px" mb="0" />
            </div>
        </div>
    </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
    <tr>
        {[...Array(columns)].map((_, i) => (
            <td key={i} style={{ padding: '15px' }}>
                <SkeletonLine width={i === 0 ? '80%' : '60%'} height="16px" mb="0" />
            </td>
        ))}
    </tr>
);

export const ListItemSkeleton = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px',
        background: 'white',
        borderRadius: '12px',
        marginBottom: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
    }}>
        <SkeletonCircle size="50px" />
        <div style={{ flex: 1 }}>
            <SkeletonLine width="70%" height="16px" mb="6px" />
            <SkeletonLine width="40%" height="12px" mb="0" />
        </div>
        <SkeletonLine width="80px" height="32px" mb="0" radius="20px" />
    </div>
);

// Hayvan kartları için skeleton
export const AnimalCardSkeleton = () => (
    <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <SkeletonLine width="50%" height="22px" mb="0" />
            <SkeletonLine width="60px" height="26px" mb="0" radius="12px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
            {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
                    <SkeletonLine width="60%" height="10px" mb="6px" />
                    <SkeletonLine width="40%" height="18px" mb="0" />
                </div>
            ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <SkeletonLine width="100%" height="40px" mb="0" radius="8px" />
        </div>
    </div>
);

// Grid skeleton wrapper
export const SkeletonGrid = ({ count = 6, Card = AnimalCardSkeleton }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    }}>
        {[...Array(count)].map((_, i) => <Card key={i} />)}
    </div>
);

// Finansal grafik için skeleton
export const ChartSkeleton = ({ height = '300px' }) => (
    <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
        <SkeletonLine width="40%" height="20px" mb="20px" />
        <SkeletonCard height={height} mb="0" />
    </div>
);

export default {
    SkeletonLine,
    SkeletonCircle,
    SkeletonCard,
    DashboardCardSkeleton,
    TableRowSkeleton,
    ListItemSkeleton,
    AnimalCardSkeleton,
    SkeletonGrid,
    ChartSkeleton
};
