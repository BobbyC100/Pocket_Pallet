// Producer card types for recommendations

export type ProducerClassMin =
  | 'Grower-Producer'
  | 'Independent'
  | 'Cooperative'
  | 'Negociant'
  | 'Industrial';

export type FarmingFlag = 'Organic' | 'Biodynamic' | 'Low-Intervention' | 'Sustainable';

export type ProducerCard = {
  id: number;
  name: string;
  class: ProducerClassMin;
  flags?: FarmingFlag[];
  summary?: string; // optional, for tooltips
  created_at: string;
  updated_at?: string;
};

export type ProducerCardCreate = {
  name: string;
  class?: ProducerClassMin;
  flags?: FarmingFlag[];
  summary?: string;
};

export type ProducerCardUpdate = Partial<ProducerCardCreate>;

export type ProducerBoostResult = {
  producer_id: number;
  boost: number;
  rationale_line: string;
  breakdown: {
    class: ProducerClassMin;
    flags: FarmingFlag[];
  };
};

