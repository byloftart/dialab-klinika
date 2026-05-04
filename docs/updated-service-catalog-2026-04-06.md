# Updated Service Catalog Draft — 2026-04-06

Source files:

- `/Users/iram/Projects/Dialab/Dialab Clinic/Services/Dialab price diaqnostik xidmətlər.doc`
- `/Users/iram/Projects/Dialab/Dialab Clinic/Services/Dialab price labarator müayinələr.doc`

Prepared in the same structural style as `scripts/seed-service-catalog.ts`.

```ts
const diagnosticsSeed = [
  {
    titleAz: "Ultrasəs Müayinəsi (USM)",
    descriptionAz:
      "Kiçik çanaq üzvləri, hamiləlik, daxili orqanlar, damarlar və digər anatomik sahələr üzrə ultrasəs müayinələri.",
    icon: "activity",
    order: 0,
    subServices: [
      "Kiçik çanaq üzvlərinin USM-i",
      "Hamiləliyin USM-i və Doppleroqrafiya",
      "Daxili orqanların USM-i",
      "Damarların doppleroqrafiyası",
      "Qalxanabənzər vəzi, limfa düyünləri və yumşaq toxumaların USM-i",
      "Prostat, xayalar və uroloji USM müayinələri",
    ],
  },
  {
    titleAz: "Kardioloji Xidmətlər",
    descriptionAz:
      "Həkim-kardioloq qəbulu və ürək-damar sisteminin əsas funksional diaqnostikası.",
    icon: "cardio",
    order: 1,
    subServices: [
      "Həkim-kardioloq qəbulu və təyinatı",
      "Elektrokardioqramma",
      "Rəngli exo dopplerokardioqrafiya",
    ],
  },
  {
    titleAz: "Ginekoloji Xidmətlər",
    descriptionAz:
      "Qadın sağlamlığı üzrə qəbul, prosedurlar və diaqnostik-müalicəvi manipulyasiyalar.",
    icon: "gyneco",
    order: 2,
    subServices: [
      "Həkim-ginekoloq qəbulu və baxış",
      "Kolposkopiya və exohisterosalpinqoqrafiya",
      "Biopsiya və diaqnostik qaşınma",
      "Uşaqlıq boynu eroziyasının müalicəsi və foto-koaqulyasiya",
      "Uşaqlıq daxili spiralın qoyulması və çıxarılması",
      "Sonsuzluğun müalicəsi və digər ginekoloji prosedurlar",
    ],
  },
  {
    titleAz: "Dermatoveneroloji Xidmətlər",
    descriptionAz:
      "Dəri və uro-genital sahə üzrə həkim qəbulu, infeksion vəziyyətlərin müalicəsi və prosedurlar.",
    icon: "doctor",
    order: 3,
    subServices: [
      "Həkim-dermatoveneroloq qəbulu və təyinatı",
      "Kəskin və xroniki uretritin müalicəsi",
      "Herpes və sitomeqalovirusla bağlı müalicə proqramları",
      "Prostat vəzisi və kişi sonsuzluğu ilə bağlı prosedurlar",
      "Lazeroterapiya, maqnitoterapiya və immunostimulyasiya",
      "Xal, papilloma və piqment ləkələrinin götürülməsi",
    ],
  },
  {
    titleAz: "Terapevtik Xidmətlər",
    descriptionAz:
      "Həkim-terapevt qəbulu və daxili xəstəliklər üzrə istiqamətləndirilmiş müalicə proqramları.",
    icon: "stethoscope",
    order: 4,
    subServices: [
      "Həkim-terapevt qəbulu və təyinatı",
      "Ürək-qan damar sistemi xəstəlikləri",
      "Həzm sistemi xəstəlikləri",
      "Tənəffüs sistemi xəstəlikləri",
      "Allergik və oynaq xəstəlikləri",
      "Hidrokolonoterapiya və plazmaferez",
    ],
  },
  {
    titleAz: "Nevroloji Xidmətlər",
    descriptionAz:
      "Həkim-nevropatoloq qəbulu, EEQ və sinir sistemi pozğunluqlarının diaqnostika və bərpa proqramları.",
    icon: "neuro",
    order: 5,
    subServices: [
      "Həkim-nevropatoloq qəbulu və təyinatı",
      "Elektroensefaloqramma (EEQ) və gecə monitorinqi",
      "Nevrozlar, somatoform və konversion pozulmalar",
      "Baş ağrıları və miqrenlərin idarə olunması",
      "Baş və onurğa beyni qan dövranı pozğunluqları",
      "Reabilitasiya və bərpa müalicəsi",
    ],
  },
  {
    titleAz: "İxtisas Həkim Qəbulları",
    descriptionAz:
      "Endokrinoloq, uroloq və oftalmoloq üzrə ilkin qəbul və ixtisas yönümlü müayinələr.",
    icon: "user",
    order: 6,
    subServices: [
      "Həkim-endokrinoloq qəbulu və təyinatı",
      "Həkim-uroloq qəbulu və təyinatı",
      "Həkim-oftalmoloq qəbulu və təyinatı",
      "Göz dibinin müayinəsi",
    ],
  },
  {
    titleAz: "Manipulyasiyalar və Digər Xidmətlər",
    descriptionAz:
      "Gündəlik prosedurlar, reabilitasiya, fizioterapiya və əlavə tibbi xidmətlər.",
    icon: "ent",
    order: 7,
    subServices: [
      "Təzyiq ölçmə, venadaxili və əzələdaxili inyeksiyalar",
      "Tibb bacısının evə çağırışı",
      "Reabilitoloqun qəbulu və müalicəvi idman",
      "Elektroterapiya, ultrasəs terapiya və maqnitoterapiya",
      "Lazeroterapiya, parafinoterapiya və darsonvalizasiya",
      "Tibbi masaj proqramları",
    ],
  },
];

const laboratorySeed = [
  {
    titleAz: "Kliniki Analizlər",
    descriptionAz:
      "Qan, sidik, nəcis, bəlğəm, sperma və digər ilkin laborator nümunələrin ümumi klinik qiymətləndirilməsi.",
    icon: "blood",
    order: 0,
    subTests: [
      ["Qanın ümumi analizi", "Leykoformula və əsas hematoloji göstəricilər"],
      ["Sidiyin ümumi analizi", "Sidik göstəriciləri və çöküntünün mikroskopiyası"],
      ["Nəcisin ümumi analizi", "Nəcis və gizli qan testləri"],
      ["Bəlğəm və digər mayelərin müayinəsi", "BK və ümumi laborator baxış"],
      ["Spermoqramma və prostat materialları", "Androloji ilkin laboratoriya"],
      ["Qan qrupu və rezus-faktor", "Transfuzioloji əsas testlər"],
    ],
  },
  {
    titleAz: "Bakterioloji Analizlər",
    descriptionAz:
      "Əkilmələr, sterillik yoxlamaları və antibiotikoqramma ilə mikrobioloji diaqnostika.",
    icon: "microscope",
    order: 1,
    subTests: [
      ["Qanın sterilliyi", "Qan nümunəsinin bakterioloji əkilməsi"],
      ["Sidik və nəcis əkilməsi", "Sidik yolu və bağırsaq mikroflorası"],
      ["Sperma, prostat və uretra materialları", "Urogenital bakterioloji müayinələr"],
      ["Uşaqlıq yolu möhtəviyyatı", "Ginekoloji bakterioloji əkilmələr"],
      ["Əsnək, burun, qulaq və göz yaxmaları", "LOR və oftalmoloji materiallar"],
      ["Antibiotikoqramma", "Patogenlərin antibiotiklərə həssaslığı"],
    ],
  },
  {
    titleAz: "Seroloji Testlər",
    descriptionAz:
      "İnfeksiya, iltihab və autoimmun markerlərin seroloji səviyyədə qiymətləndirilməsi.",
    icon: "immune",
    order: 2,
    subTests: [
      ["RPR", "Sifilis üçün seroloji skrininq"],
      ["Antistreptolizin-O", "Poststreptokokk vəziyyətlərinin qiymətləndirilməsi"],
      ["CRP", "Kəskin iltihab markerləri"],
      ["Revmatoid faktor", "Revmatoloji skrininq"],
      ["Sial turşusu", "İltihabi və metabolik qiymətləndirmə"],
    ],
  },
  {
    titleAz: "Hormonların Tədqiqi",
    descriptionAz:
      "Reproduktiv, tiroid, adrenal və metabolik hormonların geniş laborator paneli.",
    icon: "biochemical",
    order: 3,
    subTests: [
      ["Reproduktiv hormonlar", "FSH, LH, progesteron, estradiol, AMH və digərləri"],
      ["Tiroid hormonları", "T3, T4, sərbəst fraksiyalar və TSH"],
      ["Androgen və adrenal hormonlar", "Testosteron, DEA-S, kortizol, ACTH"],
      ["Metabolik markerlər", "İnsulin, C-peptid, SHBG"],
      ["Vitamin və dəmir paneli", "Vitamin D, B12, folat, ferritin, transferrin"],
      ["Autoimmun və reproduktiv antitellər", "ANA, AFA, Anti-Cardiolipin, ASA"],
    ],
  },
  {
    titleAz: "İnfeksiya və Urogenital Testlər",
    descriptionAz:
      "Qanda və urogenital materiallarda infeksiyaların seroloji və RİF üsulu ilə aşkarlanması.",
    icon: "immune",
    order: 4,
    subTests: [
      ["TORCH paneli", "Toxoplazma, CMV, rubella və digər əsas infeksiyalar"],
      ["Herpes və cinsi yolla ötürülən infeksiyalar", "HSV, chlamydia, mycoplasma, ureaplasma"],
      ["Hepatit və HİV testləri", "Hepatit A/B/C, HİV və kart-testlər"],
      ["Parazitar və digər infeksiyalar", "Lyambliya, askarid, ornitoz və digərləri"],
      ["Helicobacter pylori və LE-hüceyrələr", "Mədə və autoimmun skrininq"],
      ["Urogenital RİF müayinələri", "Uretra və servikal materiallardan infeksiya aşkarlanması"],
    ],
  },
  {
    titleAz: "Biokimyəvi Analizlər",
    descriptionAz:
      "Orqan funksiyası, metabolizm, lipid və elektrolit balansının biokimyəvi laborator qiymətləndirilməsi.",
    icon: "flask",
    order: 5,
    subTests: [
      ["Zülal və bilirubin göstəriciləri", "Ümumi zülal, albumin, bilirubin fraksiyaları"],
      ["Qaraciyər fermentləri", "ALT, AST, QQT, ALP və digər markerlər"],
      ["Karbohidrat mübadiləsi", "Qlükoza, şəkər yükləməsi, HbA1c"],
      ["Böyrək göstəriciləri", "Kreatinin, sidik cövhəri, sidik turşusu"],
      ["Lipid spektri", "Xolesterin, triqliseridlər, HDL, LDL, VLDL"],
      ["Fermentlər, elektrolitlər və mikroelementlər", "Amilaza, lipaza, K, Na, Ca, Mg, Zn, Fe və s."],
    ],
  },
  {
    titleAz: "Onkoloji və İmmunoloji Testlər",
    descriptionAz:
      "Onkomarkerlər, immun status və allergoloji panellərin laborator qiymətləndirilməsi.",
    icon: "genetics",
    order: 6,
    subTests: [
      ["Onkomarkerlər", "CEA, CA-125, CA-15-3, CA-19-9, AFP və digər markerlər"],
      ["Tiroid autoantitelləri", "Anti-TG və Anti-TPO"],
      ["PSA paneli", "PSA və Free PSA"],
      ["İmmunoqlobulinlər", "IgA, IgM, IgG, IgE"],
      ["Hüceyrəvi immunitet", "T- və B-limfosit göstəriciləri"],
      ["Allergo və faqositoz testləri", "Allergo test, NFA, faqositar indeks və s."],
    ],
  },
  {
    titleAz: "Koaquloqramma və Farmakoloji Metabolitlər",
    descriptionAz:
      "Laxtalanma sistemi və farmakoloji/narkotik metabolitlərin skrininq testləri.",
    icon: "droplet",
    order: 7,
    subTests: [
      ["Koaquloqramma", "Laxtalanma müddəti, INR, fibrinogen, APTT, D-dimer"],
      ["Farmakoloji metabolitlər", "Kokain, morfin, THC, marixuana, metamfetamin"],
      ["Narkotest paneli", "Çoxparametrli kart-test skrininqi"],
    ],
  },
  {
    titleAz: "PCR və Molekulyar Testlər",
    descriptionAz:
      "Polimeraz zəncirvari reaksiya ilə infeksion və virus yükü göstəricilərinin molekulyar aşkarlanması.",
    icon: "dna",
    order: 8,
    subTests: [
      ["Urogenital PCR paneli", "Neisseria, Chlamydia, Mycoplasma, Ureaplasma, Trichomonas"],
      ["Herpes və CMV PCR", "HSV II və Cytomegalovirus molekulyar aşkarlanması"],
      ["Toxoplazma, listerioz və brusella PCR", "Spesifik infeksiya panelləri"],
      ["HPV testləri", "Genotipləmə və HPV 16/18 paneli"],
      ["Hepatit B PCR", "Keyfiyyət, kəmiyyət və genotip"],
      ["Hepatit C PCR", "Keyfiyyət, kəmiyyət və genotip"],
    ],
  },
  {
    titleAz: "Histoloji və Sitoloji Müayinələr",
    descriptionAz:
      "Mayelər, yaxmalar, punktatlar və toxuma materiallarının sitoloji və histokimyəvi qiymətləndirilməsi.",
    icon: "microscope",
    order: 9,
    subTests: [
      ["Mayelərin sitologiyası", "Bəlğəm, plevra, assit və sinovial mayelər"],
      ["Yaxma və punktatlar", "Atipik hüceyrələr, süd vəzi və limfa düyünü punktatları"],
      ["Histoloji materiallar", "Rezektatlar, sümük bioptatları və qaşıntılar"],
      ["Histokimyəvi testlər", "Helicobacter pylori, qlikogen, melanin və hormon markerləri"],
      ["Pap yaxma", "Servikal kanal sitologiyası"],
    ],
  },
  {
    titleAz: "Tibbi Genetik Müayinələr",
    descriptionAz:
      "İrsi, xromosom və metabolik xəstəliklərin tibbi-genetik laborator diaqnostikası.",
    icon: "genetics",
    order: 10,
    subTests: [
      ["Hemolitik anemiyalar", "Alfa və beta talassemiya, anomal hemoqlobinlər"],
      ["Enzimopatiyalar və methemoqlobinopatiyalar", "Ferment aktivliyi və HbM testləri"],
      ["Xromosom patologiyaları", "Daun, Edvards, Klaynfelter və digər sindromlar"],
      ["Göbək qanı və prenatal müayinələr", "Postnatal və prenatal diaqnostika"],
      ["Maddələr mübadiləsi xəstəlikləri", "Amin turşuları, karbohidratlar və metabolik skrininq"],
      ["Mukopolisaxaridlər", "Sidik və qanda geniş metabolik panel"],
    ],
  },
];
```

Notes:

- This draft is intentionally normalized for CMS grouping, not copied line-by-line from the original price lists.
- Prices are present in the source documents, but this structure is optimized for `diagnosticServices` / `laboratoryAnalysisTypes` and `subServices` / `subTests`.
- If needed, the next step can split these groups into:
  - CMS category structure
  - separate static price pages
  - assistant-ready preparation/price reference content
