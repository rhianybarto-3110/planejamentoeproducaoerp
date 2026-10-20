/**
 * Utilitários de formatação e máscaras para moeda, documentos e datas (pt-BR)
 */

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(val || 0);
};

export const formatNumber = (val: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(val || 0);
};

export const formatDate = (isoString?: string): string => {
  if (!isoString) return '-';
  const parts = isoString.split('T')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return isoString;
  }
};

export const formatTimeMinutes = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = Math.round(minutes % 60);
  if (remainingMin === 0) return `${hours}h`;
  return `${hours}h ${remainingMin}m`;
};

// Mask Document CPF/CNPJ
export const formatDocument = (doc: string): string => {
  const clean = (doc || '').replace(/\D/g, '');
  if (clean.length <= 11) {
    // CPF: 000.000.000-00
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  // CNPJ: 00.000.000/0000-00
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

// Mask Phone: (11) 98765-4321
export const formatPhone = (phone: string): string => {
  const clean = (phone || '').replace(/\D/g, '');
  if (clean.length <= 10) {
    return clean
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14);
  }
  return clean
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

// Generate clean unique codes
export const generateNextCode = (prefix: string, existingCodes: string[]): string => {
  const currentYear = new Date().getFullYear();
  let maxNum = 0;
  
  existingCodes.forEach((c) => {
    const match = c.match(new RegExp(`${prefix}-(?:${currentYear}-)?(\\d+)`));
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  const nextNum = maxNum + 1;
  const padded = nextNum.toString().padStart(3, '0');
  return `${prefix}-${padded}`;
};
