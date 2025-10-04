export interface CashData {
  cash: number;
  monthlyBurn: number;
}

export const calculateRunway = (cash: number, monthlyBurn: number): number => {
  if (monthlyBurn <= 0) return Infinity;
  return Math.floor(cash / monthlyBurn);
};

export const formatRunway = (months: number): string => {
  if (months === Infinity) return '∞ months';
  if (months < 1) return '< 1 month';
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
};

