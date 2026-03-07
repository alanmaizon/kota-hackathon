export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  teamSize: string;
  description: string;
  features: string[];
  cta: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'startup',
    name: 'Startup',
    price: '\u20AC/\u00A39 per employee monthly',
    teamSize: '1\u201330',
    description:
      'Perfect for local teams looking to start on the right foot with benefits.',
    features: [
      'Enrol in core & flexible benefits',
      'HRIS Integrations',
      'Automated reporting & payroll reconciliation',
      'Educational material',
      'Live chat support',
      'Mobile and web app for employees',
    ],
    cta: 'Book a demo',
  },
  {
    id: 'scaleup',
    name: 'Scaleup',
    price: '\u20AC/\u00A36 per employee monthly',
    teamSize: '31\u2013200',
    description:
      'Ideal for growing companies needing efficient people & finance processes.',
    features: [
      'Enrol in core & flexible benefits',
      'HRIS Integrations',
      'Automated reporting & payroll reconciliation',
      'Educational material',
      'Live chat support',
      'Mobile and web app for employees',
      'Live onboarding webinar',
    ],
    cta: 'Book a demo',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 'Talk to our team',
    teamSize: '201+',
    description:
      'Made for competitive companies with well-defined processes & benefits.',
    features: [
      'Enrol in core & flexible benefits',
      'HRIS Integrations',
      'Automated reporting & payroll reconciliation',
      'Educational material',
      'Live chat support',
      'Mobile and web app for employees',
      'Live onboarding webinar',
      'Access team of benefits experts',
    ],
    cta: 'Book a demo',
  },
];
