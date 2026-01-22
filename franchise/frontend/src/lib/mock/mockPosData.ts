import { MOCK_STORES } from './mockData';

// 1. Interfaces
export interface PosDailySales {
    storeId: string;
    date: string;         // YYYY-MM-DD
    revenue: number;      // Total Sales
    orderCount: number;
    aov: number;          // Average Order Value (calc: revenue / orderCount)
    originalRevenue: number; // Before discount (optional, for margin calc)
    cost: number;         // COGS
    margin: number;       // Revenue - Cost
    channel: {
        offline: number;  // Hall
        delivery: number; // App/Delivery
        takeout: number;
    };
    isAnomaly?: boolean;  // Flag for out-of-bounds data
}

export interface MenuPerformance {
    menuId: string;
    menuName: string;
    category: string;
    salesQty: number;
    revenue: number;
    cost: number;
    margin: number;
}

export interface StorePosPerformance {
    storeId: string;
    dailySales: PosDailySales[]; // 90 days history
    menuPerformance: MenuPerformance[]; // Aggregated for the period
}

// 2. Helper to generate random daily data
function generateDailyData(storeId: string, days: number): PosDailySales[] {
    const data: PosDailySales[] = [];
    const today = new Date();

    // Base performance characteristics per store (randomized slightly)
    const baseDailyOrder = 50 + Math.floor(Math.random() * 50); // 50 ~ 100 orders
    const baseAov = 25000 + Math.floor(Math.random() * 5000);   // 25k ~ 30k KRW

    for (let i = days; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Seasonality / Weekend factor
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const factor = isWeekend ? 1.3 : 1.0;

        // Random Variation (+- 20%)
        const variation = 0.8 + Math.random() * 0.4;

        let orderCount = Math.floor(baseDailyOrder * factor * variation);
        const aov = Math.floor(baseAov * variation);

        // Inject Anomaly (Randomly 2% chance)
        const isAnomaly = Math.random() < 0.02;
        if (isAnomaly) {
            // Drop significantly (e.g., system failure or closed)
            orderCount = Math.floor(orderCount * 0.2);
        }

        const revenue = orderCount * aov;
        const cost = Math.floor(revenue * 0.65); // 35% margin roughly
        const margin = revenue - cost;

        data.push({
            storeId,
            date: dateStr,
            revenue,
            orderCount,
            aov,
            originalRevenue: Math.floor(revenue * 1.1),
            cost,
            margin,
            channel: {
                offline: Math.floor(revenue * 0.5),
                delivery: Math.floor(revenue * 0.3),
                takeout: Math.floor(revenue * 0.2),
            },
            isAnomaly
        });
    }
    return data;
}

function generateMenuPerf(): MenuPerformance[] {
    const menus = [
        { name: '슈퍼디럭스 피자', cat: 'Main', price: 28000 },
        { name: '페퍼로니 피자', cat: 'Main', price: 24000 },
        { name: '치즈 오븐 스파게티', cat: 'Side', price: 9000 },
        { name: '버팔로 윙', cat: 'Side', price: 8000 },
        { name: '콜라 1.25L', cat: 'Beverage', price: 2500 },
    ];

    return menus.map(m => {
        const qty = 50 + Math.floor(Math.random() * 500);
        const rev = qty * m.price;
        const cst = Math.floor(rev * 0.4); // 60% gross margin for menu level
        return {
            menuId: m.name, // simple ID
            menuName: m.name,
            category: m.cat,
            salesQty: qty,
            revenue: rev,
            cost: cst,
            margin: rev - cst
        };
    });
}

// 3. Generate Mock Data for All Stores
export const MOCK_POS_DATA: Record<string, StorePosPerformance> = {};

const initPosData = () => {
    try {
        if (!MOCK_STORES || !Array.isArray(MOCK_STORES)) {
            console.warn('MOCK_STORES not ready for POS Data generation');
            return;
        }
        MOCK_STORES.forEach(store => {
            MOCK_POS_DATA[store.id] = {
                storeId: store.id,
                dailySales: generateDailyData(store.id, 90), // Last 90 days
                menuPerformance: generateMenuPerf()
            };
        });
    } catch (e) {
        console.error('Failed to initialize MOCK_POS_DATA', e);
    }
};

initPosData();
