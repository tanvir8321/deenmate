import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
import SettingsCard from '@/Components/SettingsCard';
import ProfileHeader from '@/Components/ProfileHeader';
import ProfileTabs from '@/Components/ProfileTabs';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import useTranslation from '@/hooks/useTranslation';

const TAB_LABELS = {
    profile: 'ProfileTabProfile',
    security: 'ProfileTabSecurity',
    danger: 'ProfileTabDanger',
};

export default function Edit({ mustVerifyEmail, status }) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;
    const [tab, setTab] = useState('profile');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash?.replace('#', '');
        if (['profile', 'security', 'danger'].includes(hash)) setTab(hash);
    }, []);

    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
        : null;

    const tabLabelsResolved = Object.fromEntries(
        Object.entries(TAB_LABELS).map(([k, key]) => [k, t(key)]),
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-base-content">{t('Profile')}</h2>}
        >
            <Head title={t('Profile')} />

            <Container className="space-y-3 sm:space-y-4">
                <ProfileHeader user={user} memberSince={memberSince} />

                <ProfileTabs active={tab} onChange={setTab} labels={tabLabelsResolved} />

                {tab === 'profile' && (
                    <SettingsCard title={t('Profile information')} subtitle={t("Update your account's profile information and email address.")}>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </SettingsCard>
                )}

                {tab === 'security' && (
                    <SettingsCard title={t('Update Password')} subtitle={t('Ensure your account is using a long, random password to stay secure.')}>
                        <UpdatePasswordForm />
                    </SettingsCard>
                )}

                {tab === 'danger' && (
                    <SettingsCard title={t('Delete Account')} subtitle={t('Permanently delete your account and all data.')}>
                        <DeleteUserForm />
                    </SettingsCard>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}
