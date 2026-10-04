import {
  Bot, BookOpen, Boxes, BrainCircuit, Building2, Calculator, Cloud, Dumbbell, Factory, FlaskConical, Globe, GraduationCap,
  HeartPulse, Hotel, LineChart, Megaphone, PenTool, Pill, ShoppingBag, Smartphone, Stethoscope, Target, Truck, Users,
  UtensilsCrossed, Warehouse, type LucideProps,
} from 'lucide-react'

const icons = {
  Bot, BookOpen, Boxes, BrainCircuit, Building2, Calculator, Cloud, Dumbbell, Factory, FlaskConical, Globe, GraduationCap,
  HeartPulse, Hotel, LineChart, Megaphone, PenTool, Pill, ShoppingBag, Smartphone, Stethoscope, Target, Truck, Users,
  UtensilsCrossed, Warehouse,
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Component = icons[name as keyof typeof icons] ?? Boxes
  return <Component {...props} />
}
