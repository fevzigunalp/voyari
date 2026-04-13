export interface CountryMeta {
  code: string;
  name: string;
  currency: string;
  language: string[];
  plugType: string;
  emergencyNumber: string;
  schengen?: boolean;
}

export const COUNTRIES: CountryMeta[] = [
  {
    code: "TR",
    name: "Türkiye",
    currency: "TRY",
    language: ["tr"],
    plugType: "F",
    emergencyNumber: "112",
  },
  {
    code: "GR",
    name: "Yunanistan",
    currency: "EUR",
    language: ["el", "en"],
    plugType: "F",
    emergencyNumber: "112",
    schengen: true,
  },
  {
    code: "IT",
    name: "İtalya",
    currency: "EUR",
    language: ["it", "en"],
    plugType: "F/L",
    emergencyNumber: "112",
    schengen: true,
  },
  {
    code: "FR",
    name: "Fransa",
    currency: "EUR",
    language: ["fr", "en"],
    plugType: "E",
    emergencyNumber: "112",
    schengen: true,
  },
  {
    code: "ES",
    name: "İspanya",
    currency: "EUR",
    language: ["es", "en"],
    plugType: "F",
    emergencyNumber: "112",
    schengen: true,
  },
  {
    code: "DE",
    name: "Almanya",
    currency: "EUR",
    language: ["de", "en"],
    plugType: "F",
    emergencyNumber: "112",
    schengen: true,
  },
  {
    code: "CH",
    name: "İsviçre",
    currency: "CHF",
    language: ["de", "fr", "it"],
    plugType: "J",
    emergencyNumber: "112",
    schengen: true,
  },
  {
    code: "GB",
    name: "Birleşik Krallık",
    currency: "GBP",
    language: ["en"],
    plugType: "G",
    emergencyNumber: "999",
  },
  {
    code: "AE",
    name: "Birleşik Arap Emirlikleri",
    currency: "AED",
    language: ["ar", "en"],
    plugType: "G",
    emergencyNumber: "999",
  },
  {
    code: "JP",
    name: "Japonya",
    currency: "JPY",
    language: ["ja", "en"],
    plugType: "A",
    emergencyNumber: "110",
  },
  {
    code: "US",
    name: "ABD",
    currency: "USD",
    language: ["en"],
    plugType: "A/B",
    emergencyNumber: "911",
  },
];

export const getCountryByCode = (code: string): CountryMeta | undefined =>
  COUNTRIES.find((c) => c.code === code.toUpperCase());
