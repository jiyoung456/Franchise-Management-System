import { BackendConnectionTest } from '@/components/debug/BackendConnectionTest';
import Link from 'next/link';

export default function TestConnectionPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-4 text-center">
                    <Link href="/" className="text-sm text-blue-500 hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>
                <BackendConnectionTest />
            </div>
        </div>
    );
}
