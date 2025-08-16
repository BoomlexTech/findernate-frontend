'use client';

import React from 'react';

export default function EnvDebug() {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  
  return (
    <div className="p-4 bg-gray-100 rounded border m-4">
      <h3 className="font-bold mb-2">Environment Variables Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>NEXT_PUBLIC_VAPID_PUBLIC_KEY:</strong> 
          <span className="ml-2 font-mono">
            {vapidKey ? `${vapidKey.substring(0, 20)}...` : 'NOT FOUND'}
          </span>
        </div>
        <div>
          <strong>Length:</strong> 
          <span className="ml-2">{vapidKey?.length || 0} characters</span>
        </div>
        <div>
          <strong>Type:</strong> 
          <span className="ml-2">{typeof vapidKey}</span>
        </div>
        <div>
          <strong>All NEXT_PUBLIC_ vars:</strong>
          <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
            {JSON.stringify(
              Object.keys(process.env)
                .filter(key => key.startsWith('NEXT_PUBLIC_'))
                .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {}),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}