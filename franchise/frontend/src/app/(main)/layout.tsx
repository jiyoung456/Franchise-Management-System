import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Sidebar />
            <Header />
            <main className="pl-64 pt-20 min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
                <div className="p-8 max-w-[1800px] mx-auto w-full flex-1">
                    {children}
                </div>
                <Footer />
            </main>
        </>
    );
}
