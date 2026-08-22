const COUNTRY_TO_ISO = {
  'Argentina': 'AR',
  'Australia': 'AU',
  'Austria': 'AT',
  'Azerbaijan': 'AZ',
  'Bahrain': 'BH',
  'Belgium': 'BE',
  'Brazil': 'BR',
  'Canada': 'CA',
  'China': 'CN',
  'France': 'FR',
  'Germany': 'DE',
  'Hungary': 'HU',
  'India': 'IN',
  'Italy': 'IT',
  'Japan': 'JP',
  'Malaysia': 'MY',
  'Mexico': 'MX',
  'Monaco': 'MC',
  'Morocco': 'MA',
  'Netherlands': 'NL',
  'Portugal': 'PT',
  'Qatar': 'QA',
  'Russia': 'RU',
  'Saudi Arabia': 'SA',
  'Singapore': 'SG',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  'Spain': 'ES',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Turkey': 'TR',
  'UAE': 'AE',
  'UK': 'GB',
  'USA': 'US',
  'Vietnam': 'VN',
};

export function getFlagEmoji(countryName) {
  const iso = COUNTRY_TO_ISO[countryName];
  if (!iso) return '';
  return iso
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
}

export function getFlagUrl(countryName) {
  const iso = COUNTRY_TO_ISO[countryName];
  if (!iso) return null;
  return `https://flagcdn.com/24x18/${iso.toLowerCase()}.png`;
}
