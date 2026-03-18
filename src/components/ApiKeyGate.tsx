import React, { useState, useEffect } from 'react';

// Declare the global interface for the AI Studio window object
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export function ApiKeyGate({ children }: { children: React.ReactNode }) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        try {
          const result = await window.aistudio.hasSelectedApiKey();
          setHasKey(result);
        } catch (e) {
          console.error("Error checking API key:", e);
          setHasKey(false);
        }
      } else {
        // Fallback if not in the specific environment
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race condition as per instructions
        setHasKey(true);
      } catch (e) {
        console.error("Error opening key selector:", e);
        // If it fails with "Requested entity was not found", we should ideally reset
        // but for now, we'll just log it. The user can click the button again.
      }
    }
  };

  if (hasKey === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Checking configuration...</p>
        </div>
      </div>
    );
  }

  if (hasKey) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">API Key Required</h2>
        <p className="text-slate-600 mb-6">
          To generate high-quality images with Nano Banana Pro, you need to select a paid Google Cloud project API key.
        </p>
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-indigo-500 hover:text-indigo-700 underline mb-8 block"
        >
          Learn more about billing
        </a>
        <button
          onClick={handleSelectKey}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
}
