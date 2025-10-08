// Tiny producer strip for recommendation cards
import type { ProducerCard } from '@/types/producerCard';

export default function ProducerStrip({ p }: { p?: ProducerCard }) {
  if (!p) return null;
  
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">
      <span className="font-medium">{p.name}</span>
      <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs">
        {p.class}
      </span>
      {(p.flags?.slice(0, 2) ?? []).map(f => (
        <span 
          key={f} 
          className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-xs text-green-700"
        >
          {f}
        </span>
      ))}
    </div>
  );
}

