'use client';

import { useState } from 'react';

export function BackendConnectionTest() {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');
    const [data, setData] = useState<any>(null);

    const checkConnection = async () => {
        setStatus('LOADING');
        setMessage('');
        setData(null);

        try {
            const response = await fetch('/api/stores?limit=1');
            const result = await response.json();

            if (response.ok) {
                setStatus('SUCCESS');
                setMessage(`Connected! Status: ${response.status}`);
                setData(result);
            } else {
                setStatus('ERROR');
                setMessage(`Error: ${response.status} ${response.statusText}`);
                setData(result);
            }
        } catch (error: any) {
            setStatus('ERROR');
            setMessage(`Connection Failed: ${error.message}`);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Backend Connection Test</h2>
            <p className="text-gray-600 text-sm">
                Tests connection to <code>http://localhost:8080/api/stores</code> via Proxy.
            </p>

            <button
                onClick={checkConnection}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                disabled={status === 'LOADING'}
            >
                {status === 'LOADING' ? 'Connecting...' : 'Test Connection'}
            </button>

            {status !== 'IDLE' && (
                <div className={`p-4 rounded-lg text-sm ${status === 'SUCCESS' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    <p className="font-bold">{message}</p>
                    {data && (
                        <pre className="mt-2 p-2 bg-white/50 rounded overflow-auto max-h-40 text-xs">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}
