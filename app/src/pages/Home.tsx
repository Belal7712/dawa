import Hero from '../sections/Hero';
import Services from '../sections/Services';
import HowItWorks from '../sections/HowItWorks';
import EinviteShowcase from '../sections/EinviteShowcase';
import Features from '../sections/Features';
import Pricing from '../sections/Pricing';
import Testimonials from '../sections/Testimonials';
import CtaFinal from '../sections/CtaFinal';

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <EinviteShowcase />
      <Features />
      <Pricing />
      <Testimonials />
      <CtaFinal />
    </>
  );
}
