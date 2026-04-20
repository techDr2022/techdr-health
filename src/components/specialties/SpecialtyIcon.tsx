import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Apple,
  Baby,
  Bone,
  Brain,
  Droplets,
  Dumbbell,
  Eye,
  Filter,
  Flower2,
  Heart,
  HeartHandshake,
  Mic2,
  Ribbon,
  Shield,
  Sparkles,
  Stethoscope,
  Syringe,
  Wind,
  Zap,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Heart,
  Sparkles,
  Flower2,
  Baby,
  Brain,
  Bone,
  Activity,
  Zap,
  Apple,
  Wind,
  Eye,
  Mic2,
  Droplets,
  Filter,
  Ribbon,
  Stethoscope,
  Syringe,
  Shield,
  Dumbbell,
  HeartHandshake,
};

export function SpecialtyIcon({
  iconKey,
  className,
}: {
  iconKey: string;
  className?: string;
}) {
  const Cmp = MAP[iconKey] ?? Activity;
  return <Cmp className={className} aria-hidden />;
}
