import { Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { CrescentStar } from './Motifs';

export default function LandingFooter() {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-base-300 bg-base-200">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                    <div>
                        <Link href={route('dashboard')} className="flex items-center gap-2">
                            <CrescentStar className="text-primary" size={28} />
                            <span className="font-display text-lg font-bold text-base-content">DeenMate</span>
                        </Link>
                        <p className="mt-3 max-w-xs text-sm text-base-content/70">
                            {t('Landing.FooterTagline')}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-base-content/80">
                            {t('Landing.FooterProduct')}
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <a href="#features" className="text-base-content/70 hover:text-primary">
                                    {t('Landing.FooterProductFeatures')}
                                </a>
                            </li>
                            <li>
                                <Link href={route('donate')} className="text-base-content/70 hover:text-primary">
                                    {t('Donate')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-base-content/80">
                            {t('Landing.FooterLegal')}
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <Link href={route('privacy.policy')} className="text-base-content/70 hover:text-primary">
                                    {t('Landing.FooterLegalPrivacy')}
                                </Link>
                            </li>
                            <li>
                                <Link href={route('terms.ofuse')} className="text-base-content/70 hover:text-primary">
                                    {t('Landing.FooterLegalTerms')}
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://www.gnu.org/licenses/agpl-3.0.html"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="text-base-content/70 hover:text-primary"
                                >
                                    {t('Landing.FooterLegalLicense')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-base-content/80">
                            {t('Landing.FooterCommunity')}
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://github.com/tanvir8321/deenmate"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="text-base-content/70 hover:text-primary"
                                >
                                    {t('Landing.FooterCommunityGitHub')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/tanvir8321/deenmate/blob/main/CONTRIBUTING.md"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="text-base-content/70 hover:text-primary"
                                >
                                    {t('Landing.FooterCommunityContribute')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/tanvir8321/deenmate/issues"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="text-base-content/70 hover:text-primary"
                                >
                                    {t('Landing.FooterCommunityIssues')}
                                </a>
                            </li>
                            <li>
                                <a href="mailto:hello@deenmate.app" className="text-base-content/70 hover:text-primary">
                                    {t('Landing.FooterCommunityContact')}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-base-300 pt-6 text-sm text-base-content/60 sm:flex-row">
                    <p>© {year} DeenMate. {t('Free & Open Source. Licensed under AGPL-3.0.')}</p>
                    <p className="font-quran text-base">{t('Landing.FooterTagline')}</p>
                </div>
            </div>
        </footer>
    );
}
