import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import useTranslation from '@/hooks/useTranslation';

export default function DeleteUserForm({ className = '' }) {
    const { t } = useTranslation();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({ password: '' });

    const confirmUserDeletion = () => setConfirmingUserDeletion(true);
    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const inputCls = 'input input-bordered w-full';

    return (
        <section className={`space-y-3 sm:space-y-4 ${className}`}>
            <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="text-sm">
                    {t('Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.')}
                </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <DangerButton onClick={confirmUserDeletion} className="w-full sm:w-auto">
                    {t('Delete Account')}
                </DangerButton>
            </div>

            {confirmingUserDeletion && (
                <div className="modal modal-open modal-bottom sm:modal-middle" role="dialog">
                    <div className="modal-box max-w-lg p-4 sm:p-6">
                        <h3 className="text-base font-bold text-base-content sm:text-lg">
                            {t('Are you sure you want to delete your account?')}
                        </h3>
                        <p className="mt-2 text-sm text-base-content/70">
                            {t('Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.')}
                        </p>

                        <form onSubmit={deleteUser} className="mt-4 space-y-3">
                            <div className="form-control w-full">
                                <InputLabel
                                    htmlFor="password"
                                    value={t('Password')}
                                    className="label-text text-sm font-medium"
                                />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`mt-1.5 ${inputCls}`}
                                    isFocused
                                    placeholder={t('Password')}
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div className="modal-action mt-4 flex flex-col gap-2 sm:flex-row">
                                <SecondaryButton type="button" onClick={closeModal} className="w-full sm:w-auto">
                                    {t('Cancel')}
                                </SecondaryButton>
                                <DangerButton className="w-full sm:w-auto" disabled={processing}>
                                    {t('Delete Account')}
                                </DangerButton>
                            </div>
                        </form>
                    </div>
                    <button
                        type="button"
                        className="modal-backdrop"
                        onClick={closeModal}
                        aria-label={t('Close menu')}
                    />
                </div>
            )}
        </section>
    );
}
