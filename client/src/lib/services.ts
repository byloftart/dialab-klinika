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
  zap: Zap,
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

const diagnosticImagesByKey: Record<string, string> = {
  activity: '/images/diagnostics-ultrasound.jpg',
  stethoscope: '/images/doctor-consultation.jpg',
  gyneco: '/images/diagnostics-ultrasound.jpg',
  doctor: '/images/doctor-consultation.jpg',
  user: '/images/doctor-consultation.jpg',
  heart: '/images/doctor-consultation.jpg',
  neuro: '/images/medical-team-abstract.jpg',
  brain: '/images/medical-team-abstract.jpg',
  zap: '/images/hero-medical-lab.jpg',
};

const laboratoryImagesByKey: Record<string, string> = {
  blood: '/images/lab-analysis.jpg',
  biochemical: '/images/hero-medical-lab.jpg',
  vitamin: '/images/medical-team-abstract.jpg',
  immune: '/images/hero-medical-lab.jpg',
  microscope: '/images/lab-analysis.jpg',
  dna: '/images/medical-team-abstract.jpg',
  genetics: '/images/medical-team-abstract.jpg',
  pill: '/images/hero-medical-lab.jpg',
};

export function getDiagnosticPresentation(
  icon: string | null | undefined,
  index: number
) {
  const key = icon?.trim().toLowerCase() ?? '';
  const normalizedKey = key.split('-')[0];
  return {
    icon: diagnosticIconMap[key] ?? diagnosticIconMap[normalizedKey] ?? Activity,
    color: diagnosticColors[index % diagnosticColors.length],
    image:
      diagnosticImagesByKey[key] ??
      diagnosticImagesByKey[normalizedKey] ??
      '/images/diagnostics-ultrasound.jpg',
  };
}

export function getLaboratoryPresentation(icon: string | null | undefined, index: number) {
  const key = icon?.trim().toLowerCase() ?? '';
  const normalizedKey = key.split('-')[0];
  return {
    icon: laboratoryIconMap[key] ?? laboratoryIconMap[normalizedKey] ?? FlaskConical,
    color: laboratoryColors[index % laboratoryColors.length],
    image:
      laboratoryImagesByKey[key] ??
      laboratoryImagesByKey[normalizedKey] ??
      '/images/lab-analysis.jpg',
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
