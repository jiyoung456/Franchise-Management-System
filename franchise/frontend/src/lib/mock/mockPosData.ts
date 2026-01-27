import { MOCK_STORES } from './mockData';

// 1. Interfaces
export interface DailySales {
    date: string;
    amount: number;
    orderCount: number;
    // Added for compatibility with Performance pages
    revenue: number;
    cost: number;
    margin: number;
}

export interface MenuSales {
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
    storeName: string; // Added for display convenience
    dailySales: DailySales[];
    weeklySales: { week: string; sales: number }[]; // 4 weeks
    topMenus: MenuSales[];
    worstMenus: MenuSales[];
}

// 2. Data Generators
function generateDailyData(storeId: string, days: number): DailySales[] {
    const data: DailySales[] = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);

        // Random fluctuation
        const base = 800000; // 800k KRW
        const random = (Math.random() - 0.5) * 200000;
        const amount = Math.floor(base + random);
        const cost = Math.floor(amount * 0.4);

        data.push({
            date: dateStr,
            amount: amount,
            orderCount: Math.floor(amount / 15000), // Avg check 15k
            revenue: amount,
            cost: cost,
            margin: amount - cost
        });
    }
    return data;
}

function generateMenuData(count: number): MenuSales[] {
    const menus = [
        { name: '불고기버거', price: 6500, cat: 'Burger' },
        { name: '치즈버거', price: 5500, cat: 'Burger' },
        { name: '감자튀김', price: 2500, cat: 'Side' },
        { name: '콜라', price: 1500, cat: 'Drink' },
        { name: '치킨너겟', price: 3000, cat: 'Side' },
        { name: '새우버거', price: 7000, cat: 'Burger' }
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
            const sid = store.id.toString();
            MOCK_POS_DATA[sid] = {
                storeId: sid,
                storeName: store.name,
                dailySales: generateDailyData(sid, 90), // Last 90 days
                weeklySales: [
                    { week: '1주차', sales: 5500000 },
                    { week: '2주차', sales: 5800000 },
                    { week: '3주차', sales: 5200000 },
                    { week: '4주차', sales: 6100000 }
                ],
                topMenus: generateMenuData(5),
                worstMenus: generateMenuData(3)
            };
        });
    } catch (e) {
        console.error("Error generating Mock POS data", e);
    }
};

initPosData();
