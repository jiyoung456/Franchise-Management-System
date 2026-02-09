/** @type {import('next').NextConfig} */
console.log("-----------------------------------------");
console.log("LOADING NEXT.CONFIG.JS");
console.log("-----------------------------------------");

const nextConfig = {

    images: {
        unoptimized: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/actions/:id/execution',
                destination: 'http://localhost:8080/actions/:id/execution',
            },
            {
                source: '/api/actions/summary',
                destination: 'http://localhost:8080/actions/summary',
            },
            // SV QSC Endpoints (No /api prefix in Spring)
            {
                source: '/api/qsc/inspection/new',
                destination: 'http://localhost:8080/qsc/inspection/new',
            },
            {
                source: '/api/qsc/templates/:id',
                destination: 'http://localhost:8080/qsc/templates/:id',
            },
            {
                source: '/api/qsc/inspections/:path*',
                destination: 'http://localhost:8080/qsc/inspections/:path*',
            },
            {
                source: '/api/qsc/stores/test/:id',
                destination: 'http://localhost:8080/qsc/stores/test/:id',
            },
            // Standard API Endpoints (With /api prefix in Spring)
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/api/:path*',
            },


        ];
    },
};

module.exports = nextConfig;
