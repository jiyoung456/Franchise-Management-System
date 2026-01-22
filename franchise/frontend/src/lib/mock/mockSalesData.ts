
export interface DailySales {
    date: string;
    sales: number;
    orders: number;
    aov: number; // Avg Order Value
}

export interface MenuPerformance {
    menuId: string;
    menuName: string;
    category: string;
    salesAmount: number;
    salesQuantity: number;
    rank: number;
}

export interface StorePerformance {
    storeId: string;
    dailySales: DailySales[]; // Last 7 days
    weeklySales: DailySales[]; // Last 4 weeks (using same interface for simplicity)
    monthlySummary: {
        totalSales: number;
        salesGrowth: number; // Percentage
        orderGrowth: number; // Percentage
        aovGrowth: number; // Percentage
    };
    topMenus: MenuPerformance[];
    worstMenus: MenuPerformance[];
    marginRate: number;
    costRate: number;
}

// Generate some random daily data
const generateDaily = (base: number, days: number) => {
    return Array.from({ length: days }).map((_, i) => {
        const sales = base + Math.floor(Math.random() * 500000) - 250000;
        const orders = Math.floor(sales / 25000);
        return {
            date: `Day-${i + 1}`,
            sales: sales,
            orders: orders,
            aov: Math.round(sales / orders)
        };
    });
};

export const MOCK_PERFORMANCE: Record<string, StorePerformance> = {
    '1': {
        storeId: '1',
        dailySales: [
            { date: '월', sales: 4500000, orders: 180, aov: 25000 },
            { date: '화', sales: 4200000, orders: 175, aov: 24000 },
            { date: '수', sales: 4800000, orders: 190, aov: 25200 },
            { date: '목', sales: 5100000, orders: 200, aov: 25500 },
            { date: '금', sales: 6500000, orders: 250, aov: 26000 },
            { date: '토', sales: 7800000, orders: 300, aov: 26000 },
            { date: '일', sales: 7200000, orders: 280, aov: 25700 },
        ],
        weeklySales: [
            { date: '1주차', sales: 32000000, orders: 1200, aov: 26600 },
            { date: '2주차', sales: 34000000, orders: 1350, aov: 25100 },
            { date: '3주차', sales: 31000000, orders: 1150, aov: 26900 },
            { date: '4주차', sales: 38000000, orders: 1450, aov: 26200 },
        ],
        monthlySummary: {
            totalSales: 135000000,
            salesGrowth: 15,
            orderGrowth: 22,
            aovGrowth: -5
        },
        topMenus: [
            { menuId: 'm1', menuName: '시그니처 버거', category: 'Main', salesAmount: 12500000, salesQuantity: 1250, rank: 1 },
            { menuId: 'm2', menuName: '감자튀김 L', category: 'Side', salesAmount: 8400000, salesQuantity: 2800, rank: 2 },
            { menuId: 'm3', menuName: '제로 콜라', category: 'Drink', salesAmount: 4500000, salesQuantity: 3000, rank: 3 },
        ],
        worstMenus: [
            { menuId: 'm99', menuName: '채식 샐러드', category: 'Side', salesAmount: 250000, salesQuantity: 45, rank: 45 },
            { menuId: 'm98', menuName: '계절 과일 주스', category: 'Drink', salesAmount: 180000, salesQuantity: 30, rank: 46 },
        ],
        marginRate: 22.5,
        costRate: 38.4
    }
};
