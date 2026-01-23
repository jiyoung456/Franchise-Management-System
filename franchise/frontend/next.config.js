/** @type {import('next').NextConfig} */
console.log("-----------------------------------------");
console.log("LOADING NEXT.CONFIG.JS");
console.log("-----------------------------------------");

const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
