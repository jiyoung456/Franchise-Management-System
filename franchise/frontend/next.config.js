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
                destination: 'http://43.200.3.26:8080/actions/:id/execution',
            },
            {
                source: '/api/actions/summary',
                destination: 'http://43.200.3.26:8080/actions/summary',
            },
            {
                source: '/api/:path*',
                destination: 'http://43.200.3.26:8080/api/:path*',
            },


        ];
    },
};

module.exports = nextConfig;
