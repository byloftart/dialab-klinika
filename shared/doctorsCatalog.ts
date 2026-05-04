export type DoctorCatalogItem = {
  nameAz: string;
  specialtyAz: string;
  bioAz?: string | null;
  photoUrl?: string | null;
  whatsappUrl?: string | null;
  telegramUrl?: string | null;
  instagramUrl?: string | null;
  experienceYears?: number | null;
  order: number;
  isActive: boolean;
};

export const doctorsCatalog: DoctorCatalogItem[] = [
  {
    nameAz: "Məliova Kəmalə Qadil qızı",
    specialtyAz: "Həkim-ginekoloq",
    order: 0,
    isActive: true,
  },
  {
    nameAz: "Nəsibova Afaq Nadir qızı",
    specialtyAz: "Həkim-terapevt",
    bioAz:
      "Terapevtik və hematoloji xəstəliklər, anemiyalar, koaqulyasiya pozuntuları, limfadenopatiyalar və naməlum etiologiyalı qızdırmalar üzrə qəbul aparır.",
    order: 1,
    isActive: true,
  },
  {
    nameAz: "Həzrətova Xədicə Məmməd qızı",
    specialtyAz: "Həkim-nevropatoloq",
    order: 2,
    isActive: true,
  },
  {
    nameAz: "Ramazanzadə Reyhan Ramazan qızı",
    specialtyAz: "Şüa diaqnostikası üzrə həkim",
    order: 3,
    isActive: true,
  },
  {
    nameAz: "Nəsibov Etibar Nəbi oğlu",
    specialtyAz: "Şüa diaqnostikası üzrə həkim",
    order: 4,
    isActive: true,
  },
  {
    nameAz: "Əliyeva Röya Siyab qızı",
    specialtyAz: "Həkim-nevropatoloq",
    order: 5,
    isActive: true,
  },
  {
    nameAz: "Vəfa Cəbrayılova Namiq qızı",
    specialtyAz: "Həkim-kardioloq",
    order: 6,
    isActive: true,
  },
  {
    nameAz: "Səfurə Acalova Qərib qızı",
    specialtyAz: "Həkim-oftalmoloq",
    order: 7,
    isActive: true,
  },
  {
    nameAz: "Gülnar Əzizova Tahir qızı",
    specialtyAz: "Şüa diaqnostikası üzrə həkim",
    order: 8,
    isActive: true,
  },
  {
    nameAz: "Nərgiz Mehdiyeva Oruc qızı",
    specialtyAz: "Həkim-nevropatoloq",
    order: 9,
    isActive: true,
  },
];
