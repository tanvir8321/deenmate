import useTranslation from '@/hooks/useTranslation';

export default function ProfileHeader({ user, memberSince = null }) {
    const { t } = useTranslation();
    const initial = user.name?.[0]?.toUpperCase() ?? 'U';

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body flex flex-col items-center gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:p-6">
                <div className="avatar placeholder">
                    <div className="w-16 rounded-full bg-primary text-primary-content sm:w-20 lg:w-24">
                        <span className="text-2xl font-bold sm:text-3xl lg:text-4xl">{initial}</span>
                    </div>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-start">
                    <h1 className="truncate text-xl font-bold text-base-content sm:text-2xl lg:text-3xl 2xl:text-4xl">
                        {user.name}
                    </h1>
                    <p className="truncate text-sm text-base-content/60 sm:text-base">
                        {user.email}
                    </p>
                    {memberSince && (
                        <p className="mt-1 text-xs text-base-content/50">
                            {t('Member since')} {memberSince}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
