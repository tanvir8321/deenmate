import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import useTranslation from '@/hooks/useTranslation';

export default function QuickAddTodo() {
    const { t } = useTranslation();
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        due_date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (!data.title.trim()) return;
        post(route('todos.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            transform: (form) => ({
                ...form,
                due_date: form.due_date === '' ? null : form.due_date,
            }),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
            <TextInput
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder={t('+ todo')}
                aria-label={t('New todo title')}
                className="min-w-0 flex-1 text-sm"
            />
            <TextInput
                type="date"
                value={data.due_date}
                onChange={(e) => setData('due_date', e.target.value)}
                aria-label={t('Due date')}
                className="text-sm"
            />
            <PrimaryButton disabled={processing || !data.title.trim()}>{t('Add')}</PrimaryButton>
        </form>
    );
}
