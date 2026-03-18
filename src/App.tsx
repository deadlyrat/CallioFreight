/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiKeyGate } from './components/ApiKeyGate';
import { Generator } from './components/Generator';
import { Chatbot } from './components/Chatbot';
import { Palette } from 'lucide-react';

export default function App() {
  return (
    <ApiKeyGate>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Palette size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Coloring Book Creator
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Generator (takes up more space) */}
            <div className="lg:col-span-8">
              <Generator />
            </div>

            {/* Right Column: Chatbot */}
            <div className="lg:col-span-4 h-[600px] lg:h-[calc(100vh-8rem)] sticky top-24">
              <Chatbot />
            </div>
          </div>
        </main>
      </div>
    </ApiKeyGate>
  );
}

