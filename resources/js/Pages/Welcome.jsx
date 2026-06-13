import { Head } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

import LandingHeader from '@/Components/Landing/LandingHeader';
import LandingFooter from '@/Components/Landing/LandingFooter';
import Hero from '@/Components/Landing/Hero';
import ValueProps from '@/Components/Landing/ValueProps';
import Features from '@/Components/Landing/Features';
import AppPreview from '@/Components/Landing/AppPreview';
import HowItWorks from '@/Components/Landing/HowItWorks';
import Mission from '@/Components/Landing/Mission';
import Testimonials from '@/Components/Landing/Testimonials';
import DonationCTA from '@/Components/Landing/DonationCTA';
import FinalCTA from '@/Components/Landing/FinalCTA';

export default function Welcome() {
    const { isRtl } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col bg-base-100 text-base-content" dir={isRtl ? 'rtl' : 'ltr'}>
            <Head title="DeenMate" />
            <LandingHeader />
            <main id="main" className="flex-1">
                <Hero />
                <ValueProps />
                <Features />
                <AppPreview />
                <HowItWorks />
                <Mission />
                <Testimonials />
                <DonationCTA />
                <FinalCTA />
            </main>
            <LandingFooter />
        </div>
    );
}
