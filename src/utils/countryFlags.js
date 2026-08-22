const COUNTRY_TO_ISO = {
  'Australia': 'AU',
  'China': 'CN',
  'Japan': 'JP',
  'Bahrain': 'BH',
  'Saudi Arabia': 'SA',
  'USA': 'US',
  'Italy': 'IT',
  'Monaco': 'MC',
  'Spain': 'ES',
  'Canada': 'CA',
  'Austria': 'AT',
  'UK': 'GB',
  'Hungary': 'HU',
  'Belgium': 'BE',
  'Netherlands': 'NL',
  'Azerbaijan': 'AZ',
  'Singapore': 'SG',
  'Mexico': 'MX',
  'Brazil': 'BR',
  'Qatar': 'QA',
  'UAE': 'AE',
  'Portugal': 'PT',
  'France': 'FR',
  'Germany': 'DE',
  'Malaysia': 'MY',
  'South Korea': 'KR',
  'India': 'IN',
  'Turkey': 'TR',
  'Russia': 'RU',
  'Vietnam': 'VN',
  'South Africa': 'ZA',
  'Argentina': 'AR',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Morocco': 'MA',
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
