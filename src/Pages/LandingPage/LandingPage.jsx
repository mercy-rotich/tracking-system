import React from 'react';

import { FeaturesSection } from '../../components/LandingPageComponents/FeaturesSection/FeaturesSection';
import { CTASection } from '../../components/LandingPageComponents/CTASection/CTASection';

import './LandingPage.css';
import LandingPageHeader from '../../components/LandingPageComponents/LandingPageHeader/LandingPageHeader';
import { LandingPageHero } from '../../components/LandingPageComponents/LandingPageHero/LandingPageHero';
import { LandingPageFooter } from '../../components/LandingPageComponents/LandingPageFooter/LandingPageFooter';
import NewsSection from '../../components/LandingPageComponents/NewsSection/NewsSection';

function LandingPage() {
  return (
    <div className="landingpage">
      <LandingPageHeader />
      <LandingPageHero />
      <NewsSection />
      <FeaturesSection />
      <CTASection />
      <LandingPageFooter />
    </div>
  );
}

export default LandingPage;