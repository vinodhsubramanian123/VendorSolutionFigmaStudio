import React from 'react';
import { FileJson } from 'lucide-react';

interface SchemaInspectorProps {
  data: any;
  title?: string;
}

export function SchemaInspector({ data, title = "Configuration Payload Schema" }: SchemaInspectorProps) {
  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="bg-brand-gray-800 px-4 py-3 border-b border-brand-gray-700 flex items-center shrink-0">
        <FileJson className="w-4 h-4 text-brand-indigo mr-2" />
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      </div>
      <div className="p-4 overflow-auto flex-1 bg-[#0a0a0a]">
        <pre className="text-xs text-brand-indigo font-mono whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
