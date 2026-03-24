import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Baby,
  Beaker,
  Brain,
  Dna,
  Droplet,
  Ear,
  FlaskConical,
  Heart,
  Microscope,
  Pill,
  Stethoscope,
  UserRound,
  Zap,
} from 'lucide-react';

type CmsService = {
  id: number;
  titleAz: string;
  isActive?: boolean;
};

type DiagnosticDoctorMeta = {
  name: string;
  specialty: string;
  experience: string;
};

const diagnosticIconMap: Record<string, LucideIcon> = {
  activity: Activity,
  cardio: Heart,
  heart: Heart,
  neuro: Brain,
  brain: Brain,
  gyneco: Baby,
  baby: Baby,
  ent: Ear,
  ear: Ear,
  stethoscope: Stethoscope,
  doctor: UserRound,
  user: UserRound,
};

const laboratoryIconMap: Record<string, LucideIcon> = {
  droplet: Droplet,
  blood: Droplet,
  microscope: Microscope,
  bacteria: Microscope,
  beaker: Beaker,
  immune: Beaker,
  zap: Zap,
  biochemical: Zap,
  pill: Pill,
  vitamin: Pill,
  dna: Dna,
  genetics: Dna,
  flask: FlaskConical,
  lab: FlaskConical,
};

const diagnosticColors = ['#00b982', '#ef4444', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6'];
const laboratoryColors = ['#00b982', '#ef4444', '#8b5cf6', '#f59e0b', '#14b8a6', '#ec4899'];

const diagnosticImages = [
  '/images/diagnostics-ultrasound.jpg',
  '/images/doctor-consultation.jpg',
  '/images/lab-analysis.jpg',
  '/images/diagnostics-ultrasound.jpg',
  '/images/doctor-consultation.jpg',
  '/images/hero-medical-lab.jpg',
];

const laboratoryImages = [
  '/images/lab-analysis.jpg',
  '/images/medical-team-abstract.jpg',
  '/images/hero-medical-lab.jpg',
  '/images/diagnostics-ultrasound.jpg',
  '/images/doctor-consultation.jpg',
  '/images/lab-analysis.jpg',
];

const diagnosticDoctorMap: Record<string, DiagnosticDoctorMeta> = {
  'Ultrasəs Müayinəsi (USM)': {
    name: 'Dr. Aynur Məmmədova',
    specialty: 'USM Mütəxəssisi',
    experience: '12 il təcrübə',
  },
  'Kardioloji Diaqnostika': {
    name: 'Dr. Rəşad Hüseynov',
    specialty: 'Kardioloq',
    experience: '18 il təcrübə',
  },
  'Nevroloji Müayinə': {
    name: 'Dr. Leyla Əliyeva',
    specialty: 'Nevropatoloq',
    experience: '15 il təcrübə',
  },
  'Ginekoloji Müayinə': {
    name: 'Dr. Səbinə Quliyeva',
    specialty: 'Ginekoloq',
    experience: '20 il təcrübə',
  },
  'LOR Müayinəsi': {
    name: 'Dr. Kamran Əhmədov',
    specialty: 'Otolorinqoloq-Foniatr',
    experience: '14 il təcrübə',
  },
  'Ümumi Həkim Məsləhəti': {
    name: 'Dr. Nigar Həsənova',
    specialty: 'Terapevt',
    experience: '16 il təcrübə',
  },
};

export function getDiagnosticPresentation(
  icon: string | null | undefined,
  index: number,
  titleAz?: string | null
) {
  const key = icon?.trim().toLowerCase() ?? '';
  return {
    icon: diagnosticIconMap[key] ?? diagnosticIconMap[key.split('-')[0]] ?? Activity,
    color: diagnosticColors[index % diagnosticColors.length],
    image: diagnosticImages[index % diagnosticImages.length],
    doctor: titleAz ? diagnosticDoctorMap[titleAz] ?? null : null,
  };
}

export function getLaboratoryPresentation(icon: string | null | undefined, index: number) {
  const key = icon?.trim().toLowerCase() ?? '';
  return {
    icon: laboratoryIconMap[key] ?? laboratoryIconMap[key.split('-')[0]] ?? FlaskConical,
    color: laboratoryColors[index % laboratoryColors.length],
    image: laboratoryImages[index % laboratoryImages.length],
  };
}

export function buildServiceOptions(
  laboratory?: CmsService[] | null,
  diagnostics?: CmsService[] | null
) {
  const items = [
    ...(laboratory ?? []).filter((item) => item.isActive !== false).map((item) => ({
      value: `lab-${item.id}`,
      label: item.titleAz,
    })),
    ...(diagnostics ?? []).filter((item) => item.isActive !== false).map((item) => ({
      value: `diag-${item.id}`,
      label: item.titleAz,
    })),
  ];

  return items.length > 0
    ? items
    : [
        { value: 'laboratory', label: 'Laboratoriya Testləri' },
        { value: 'diagnostics', label: 'Diaqnostika Xidmətləri' },
      ];
}
