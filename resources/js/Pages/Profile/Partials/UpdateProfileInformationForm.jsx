import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const inputCls = 'input input-bordered w-full';

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="form-control w-full">
                        <InputLabel htmlFor="name" value={t('Name')} className="label-text text-sm font-medium" />
                        <TextInput
                            id="name"
                            className={`mt-1.5 ${inputCls}`}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-1" message={errors.name} />
                    </div>

                    <div className="form-control w-full">
                        <InputLabel htmlFor="email" value={t('Email')} className="label-text text-sm font-medium" />
                        <TextInput
                            id="email"
                            type="email"
                            className={`mt-1.5 ${inputCls}`}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-1" message={errors.email} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="alert alert-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <div className="text-sm">
                            {t('Your email address is unverified.')}{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="link link-warning"
                            >
                                {t('Click here to re-send the verification email.')}
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'verification-link-sent' && (
                    <div className="alert alert-success">
                        <span className="text-sm">{t('A new verification link has been sent to your email address.')}</span>
                    </div>
                )}

                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <PrimaryButton disabled={processing} className="w-full sm:w-auto">
                        {t('Save')}
                    </PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <span className="badge badge-success badge-sm">{t('Saved.')}</span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
