import React, { useEffect, useState } from 'react';
import { Coins, Download, Pencil, RefreshCw, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CurrencyRate, updateCurrencyRate, getCurrencyRate } from '../../services/currencyService';

interface CurrencyFormState {
  usd: string;
  euro: string;
}

const createFormState = (currency: CurrencyRate | null): CurrencyFormState => ({
  usd: currency ? String(currency.usd) : '',
  euro: currency ? String(currency.euro) : '',
});

const AdminCurrency: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currency, setCurrency] = useState<CurrencyRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formState, setFormState] = useState<CurrencyFormState>(createFormState(null));
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  const loadCurrency = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextCurrency = await getCurrencyRate();
      setCurrency(nextCurrency);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : t('admin.currency.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCurrency();
  }, []);

  useEffect(() => {
    if (!isEditOpen || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEditOpen]);

  const openEditModal = () => {
    setFormState(createFormState(currency));
    setFormError(null);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (isSaving) {
      return;
    }

    setIsEditOpen(false);
    setFormError(null);
  };

  const updateFormField = (field: keyof CurrencyFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmitCurrency = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const usd = Number(formState.usd);
    const euro = Number(formState.euro);

    if (formState.usd.trim() === '' || formState.euro.trim() === '') {
      setFormError(t('admin.currency.formErrorRequired'));
      return;
    }

    if (!Number.isFinite(usd) || usd <= 0 || !Number.isFinite(euro) || euro <= 0) {
      setFormError(t('admin.currency.formErrorPrice'));
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const nextCurrency = await updateCurrencyRate({ usd, euro });
      setCurrency(nextCurrency);
      setIsEditOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('admin.currency.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const formatVnd = (value: number | undefined) => {
    if (typeof value !== 'number') {
      return '-';
    }

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (value?: string) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-[#e1d4c0] bg-white/80 p-6 shadow-[0_25px_80px_rgba(47,36,28,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4c2a9] bg-[#fff6e8] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7d58]">
                <Sparkles size={14} />
                {t('admin.currency.eyebrow')}
              </div>
              <h2 className="mt-5 text-3xl font-serif font-bold text-[#2f241c] sm:text-4xl">
                {t('admin.currency.title')}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f5a46] sm:text-base">
                {t('admin.currency.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openEditModal}
                disabled={!currency}
                className="inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712] disabled:cursor-not-allowed disabled:bg-[#2f241c]/50"
              >
                <Pencil size={16} />
                {t('admin.currency.edit')}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: t('admin.currency.stats.usd'),
              value: formatVnd(currency?.usd),
              accent: 'text-[#2f241c]',
            },
            {
              label: t('admin.currency.stats.euro'),
              value: formatVnd(currency?.euro),
              accent: 'text-[#8b5e34]',
            },
            {
              label: t('admin.currency.stats.updated'),
              value: formatDateTime(currency?.updatedAt),
              accent: 'text-[#7a4d25]',
            },
            {
              label: t('admin.currency.stats.created'),
              value: formatDateTime(currency?.createdAt),
              accent: 'text-[#b8872f]',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[28px] border border-[#e1d4c0] bg-white/85 p-5 shadow-[0_20px_60px_rgba(47,36,28,0.06)]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">{stat.label}</p>
              <p className={`mt-4 break-words text-2xl font-serif font-bold ${stat.accent} sm:text-3xl`}>
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-[32px] border border-[#e1d4c0] bg-white/85 p-5 shadow-[0_20px_60px_rgba(47,36,28,0.06)] sm:p-6">
          {isLoading && (
            <div className="rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b79252]" />
              <p className="mt-4 text-sm font-semibold">{t('admin.currency.loading')}</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 text-red-700">
              <p className="text-sm font-semibold">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadCurrency()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712]"
              >
                <RefreshCw size={16} />
                {t('admin.currency.retry')}
              </button>
            </div>
          )}

          {!isLoading && !loadError && currency && (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="rounded-[28px] border border-[#eadfce] bg-[#fffdf9] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7d58]">
                      {t('admin.currency.summary.title')}
                    </p>
                    <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
                      {t('admin.currency.summary.subtitle')}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede2] text-[#9a7d58]">
                    <Coins size={22} />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-[#f7efe4] px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7258]">USD</p>
                    <p className="mt-2 text-2xl font-bold text-[#2f241c]">1 USD = {formatVnd(currency.usd)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f7efe4] px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7258]">EUR</p>
                    <p className="mt-2 text-2xl font-bold text-[#2f241c]">1 EUR = {formatVnd(currency.euro)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#eadfce] bg-[#fffdf9] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7d58]">
                  {t('admin.currency.metadata.title')}
                </p>

                <div className="mt-5 space-y-4 text-sm text-[#6f5a46]">
                  <div className="rounded-2xl bg-[#f7efe4] px-4 py-4">
                    <p className="font-semibold text-[#2f241c]">{t('admin.currency.metadata.recordId')}</p>
                    <p className="mt-1 break-all">{currency.id}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f7efe4] px-4 py-4">
                    <p className="font-semibold text-[#2f241c]">{t('admin.currency.metadata.createdAt')}</p>
                    <p className="mt-1">{formatDateTime(currency.createdAt)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f7efe4] px-4 py-4">
                    <p className="font-semibold text-[#2f241c]">{t('admin.currency.metadata.updatedAt')}</p>
                    <p className="mt-1">{formatDateTime(currency.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d120b]/60 p-4">
          <div className="w-full max-w-xl rounded-[32px] bg-[#fff8ee] shadow-[0_40px_120px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#ecdcc8] px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                  {t('admin.currency.formEyebrow')}
                </p>
                <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
                  {t('admin.currency.editTitle')}
                </h3>
                <p className="mt-2 text-sm text-[#6f5a46]">{t('admin.currency.formSubtitle')}</p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddcfbc] text-[#6f5a46] transition hover:border-[#c59f58] hover:text-[#2f241c]"
                aria-label={t('admin.currency.close')}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCurrency} className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.currency.fields.usd')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formState.usd}
                    onChange={(event) => updateFormField('usd', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.currency.placeholders.usd')}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.currency.fields.euro')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formState.euro}
                    onChange={(event) => updateFormField('euro', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.currency.placeholders.euro')}
                    required
                  />
                </div>
              </div>

              {formError && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#ecdcc8] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#d7c8b5] px-5 text-sm font-semibold text-[#2f241c] transition hover:border-[#c59f58] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('admin.currency.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2f241c] px-5 text-sm font-semibold text-white transition hover:bg-[#1f1712] disabled:cursor-not-allowed disabled:bg-[#2f241c]/60"
                >
                  {isSaving ? t('admin.currency.savingUpdate') : t('admin.currency.saveUpdate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCurrency;
