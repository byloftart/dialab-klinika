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

export function getDiagnosticPresentation(icon: string | null | undefined, index: number) {
  const key = icon?.trim().toLowerCase() ?? '';
  return {
    icon: diagnosticIconMap[key] ?? diagnosticIconMap[key.split('-')[0]] ?? Activity,
    color: diagnosticColors[index % diagnosticColors.length],
    image: diagnosticImages[index % diagnosticImages.length],
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
