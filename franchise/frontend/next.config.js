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
                source: '/api/:path*',
                destination: 'http://localhost:8080/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
