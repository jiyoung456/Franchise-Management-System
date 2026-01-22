import { Footer } from "@/components/layout/Footer";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className="flex-1 flex items-center justify-center">
                {children}
            </div>
            <Footer />
        </div>
    );
}
