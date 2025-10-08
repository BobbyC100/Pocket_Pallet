// Recommendation card with producer strip
import ProducerStrip from '@/components/ProducerStrip';
import type { ProducerCard } from '@/types/producerCard';

type Rec = {
  wineName: string;
  vintage?: number | 'NV';
  price?: string;
  rationale: string;
  producer?: ProducerCard;
  score?: number;
};

export function RecommendationCard({ rec }: { rec: Rec }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          {rec.wineName}{' '}
          {rec.vintage ? (
            <span className="font-normal text-gray-500">{String(rec.vintage)}</span>
          ) : null}
        </h3>
        <div className="flex items-center gap-2">
          {rec.price ? (
            <div className="text-sm font-medium text-gray-600">{rec.price}</div>
          ) : null}
          {rec.score !== undefined ? (
            <div className="rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-700">
              {Math.round(rec.score * 100)}%
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-800">{rec.rationale}</p>

      <ProducerStrip p={rec.producer} />
    </div>
  );
}

