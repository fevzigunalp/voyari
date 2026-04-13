import type { TravelProfileType } from "@/lib/types/traveler-profile";

export interface ProfileTypeMeta {
  id: TravelProfileType;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  traits: string[];
  planFocus: string[];
}

export const PROFILE_TYPES: Record<TravelProfileType, ProfileTypeMeta> = {
  luxury_sea: {
    id: "luxury_sea",
    label: "Lüks Deniz",
    tagline: "Gulet, yat ve özel koylar",
    description:
      "Özel gulet veya yatta, sakin koylar ve gurme masalarla geçen lüks bir deniz deneyimi.",
    icon: "⛵",
    accent: "#38BDF8",
    traits: ["mahremiyet", "lüks", "deniz", "gurme"],
    planFocus: ["koy rotaları", "premium gulet", "özel şef menüsü", "su sporları"],
  },
  road_trip: {
    id: "road_trip",
    label: "Road Trip",
    tagline: "Aracınla özgürce",
    description:
      "Kendi aracınızla çok şehirli, çok ülkeli, doyasıya manzaralı bir yol macerası.",
    icon: "🚗",
    accent: "#D4A853",
    traits: ["özgürlük", "esneklik", "çok durak", "manzara"],
    planFocus: ["günlük etaplar", "panoramik rotalar", "otopark bilgisi", "yakıt hesabı"],
  },
  caravan: {
    id: "caravan",
    label: "Karavan",
    tagline: "Evin hep yanında",
    description:
      "Doğa ile iç içe, karavan park ve kamp noktalarıyla özgür bir kaçış.",
    icon: "🚐",
    accent: "#10B981",
    traits: ["doğa", "bağımsızlık", "kamp", "esneklik"],
    planFocus: ["karavan parkı", "boşaltım noktası", "doğa rotaları", "kamp kuralları"],
  },
  city_explorer: {
    id: "city_explorer",
    label: "Şehir Kaşifi",
    tagline: "Kültür + sokak hayatı",
    description: "Büyük şehirlerin kültür, mimari ve sokak lezzetlerinde derinleşme.",
    icon: "🏙️",
    accent: "#F59E0B",
    traits: ["kültür", "mimari", "yürüyüş", "müze"],
    planFocus: ["yürüyüş rotaları", "müze bileti", "butik oteller", "sokak yemeği"],
  },
  family_fun: {
    id: "family_fun",
    label: "Aile Tatili",
    tagline: "Çocuklar için eğlenceli, güvenli",
    description: "Her yaşa uygun aktiviteler, rahat transferler ve çocuk dostu konaklama.",
    icon: "👨‍👩‍👧",
    accent: "#FB7185",
    traits: ["güvenli", "eğlenceli", "dinlenmeli", "esnek tempo"],
    planFocus: ["tema park", "çocuk menüleri", "aile suit", "kısa transferler"],
  },
  adventure: {
    id: "adventure",
    label: "Macera",
    tagline: "Trekking, dalış, safari",
    description: "Adrenalin dolu outdoor aktiviteler ve fiziksel zorluklar.",
    icon: "🥾",
    accent: "#10B981",
    traits: ["aktif", "outdoor", "fiziksel", "doğa"],
    planFocus: ["trekking rotası", "rehberli tur", "ekipman listesi", "zorluk seviyesi"],
  },
  wellness: {
    id: "wellness",
    label: "Wellness",
    tagline: "Spa, yoga, detoks",
    description: "Yavaş tempo, spa, yoga ve ruh/beden yenileme odaklı seyahat.",
    icon: "🧘",
    accent: "#38BDF8",
    traits: ["sakin", "yavaş", "sağlık", "lüks"],
    planFocus: ["spa rezervasyon", "yoga seansı", "sağlıklı menü", "sessiz otel"],
  },
  backpacker: {
    id: "backpacker",
    label: "Sırt Çantalı",
    tagline: "Ekonomik, özgür, solo",
    description: "Düşük bütçe, yerel deneyim, hostel ve tren odaklı özgür seyahat.",
    icon: "🎒",
    accent: "#F59E0B",
    traits: ["ekonomik", "solo", "yerel", "esnek"],
    planFocus: ["hostel", "toplu taşıma", "ucuz lezzetler", "serbest gün"],
  },
  cruise: {
    id: "cruise",
    label: "Cruise",
    tagline: "Yüzen otel",
    description: "Gemide konaklama, birden fazla limana uğrayan keyifli program.",
    icon: "🚢",
    accent: "#38BDF8",
    traits: ["konforlu", "çok liman", "all-in", "sosyal"],
    planFocus: ["liman programı", "onshore tur", "gemi aktivitesi", "paket seçimi"],
  },
  cultural_deep: {
    id: "cultural_deep",
    label: "Kültür Dalışı",
    tagline: "Tarih, arkeoloji, müze",
    description: "Antik yerleşimler, müzeler ve derin kültürel hikâyelere odaklı program.",
    icon: "🏛️",
    accent: "#D4A853",
    traits: ["tarih", "derin", "rehberli", "müze"],
    planFocus: ["arkeolojik alan", "uzman rehber", "müze kart", "tema odaklı"],
  },
  romantic: {
    id: "romantic",
    label: "Romantik",
    tagline: "Çiftler için özel",
    description: "Romantik akşam yemekleri, gün batımı rotaları ve butik konaklamalar.",
    icon: "💞",
    accent: "#FB7185",
    traits: ["romantik", "çift", "lüks dokunuş", "özel"],
    planFocus: ["sunset noktaları", "şef masası", "boutique hotel", "sürprizler"],
  },
  gastro_tour: {
    id: "gastro_tour",
    label: "Gastronomi",
    tagline: "Yemek odaklı seyahat",
    description: "Yerel mutfaklar, pazar turları, şefle atölye ve gurme restoranlar.",
    icon: "🍷",
    accent: "#F59E0B",
    traits: ["gurme", "pazar", "atölye", "yerel"],
    planFocus: ["must-try yemek", "şef masası", "yerel pazar", "şarap eşleşmesi"],
  },
  photography: {
    id: "photography",
    label: "Fotoğraf",
    tagline: "Görsel rotalar, golden hour",
    description: "Işığı doğru yakalayan noktalar, altın saat ve fotoğraf odaklı rotalar.",
    icon: "📷",
    accent: "#D4A853",
    traits: ["görsel", "golden hour", "panorama", "zamanlama"],
    planFocus: ["altın saat", "vista noktaları", "sunrise/sunset", "drone kuralları"],
  },
  digital_nomad: {
    id: "digital_nomad",
    label: "Dijital Göçebe",
    tagline: "Wifi, coworking, uzun kalış",
    description: "Çalışmaya uygun konaklama, coworking alanları ve uzun kalışlar.",
    icon: "💻",
    accent: "#38BDF8",
    traits: ["wifi", "uzun kalış", "coworking", "sakin"],
    planFocus: ["hızlı wifi", "coworking", "aylık konaklama", "zaman dilimi"],
  },
};

export const PROFILE_TYPE_LIST: ProfileTypeMeta[] = Object.values(PROFILE_TYPES);
