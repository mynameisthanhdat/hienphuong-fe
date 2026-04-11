import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Rating, RoundedStar } from '@smastrom/react-rating';
import { useTranslation } from 'react-i18next';
import '@smastrom/react-rating/style.css';
import { createComment } from '../services/commentService';

type CommentFormState = {
  name: string;
  rating: number;
  comment: string;
};

const initialFormState: CommentFormState = {
  name: '',
  rating: 5,
  comment: '',
};

const inputRatingStyles = {
  itemShapes: RoundedStar,
  itemStrokeWidth: 1.5,
  activeFillColor: '#c59f58',
  inactiveFillColor: '#efe4d3',
  activeStrokeColor: '#c59f58',
  inactiveStrokeColor: '#d9c4a4',
};

const formatRatingValue = (value: number) => (value % 1 === 0 ? String(value) : value.toFixed(1));

const Comment: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CommentFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const visibleRating = hoveredRating ?? formData.rating;

  const handleChange =
    (field: 'name' | 'comment') =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = formData.name.trim();
    const trimmedComment = formData.comment.trim();
    const parsedRating = formData.rating;

    if (!trimmedName || !trimmedComment) {
      setErrorMessage(t('commentPage.formErrorRequired'));
      return;
    }

    if (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      setErrorMessage(t('commentPage.formErrorRating'));
      return;
    }

    try {
      setIsSubmitting(true);

      await createComment({
        name: trimmedName,
        rating: parsedRating,
        comment: trimmedComment,
      });

      setFormData(initialFormState);
      setSuccessMessage(t('commentPage.successMessage'));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('commentPage.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brown-50">
      <section className="relative flex h-[40vh] min-h-[320px] items-center justify-center overflow-hidden bg-brown-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://picsum.photos/1920/1080?random=28")' }}
        ></div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,24,18,0.52)_0%,rgba(34,24,18,0.82)_100%)]"></div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6">
          <h1 className="mt-5 text-5xl font-serif font-bold text-white drop-shadow-lg sm:text-6xl">
            {t('commentPage.title')}
          </h1>
        </div>
      </section>

      <section className="relative -mt-16 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="">
            <div className="rounded-[32px] border border-[#eadfce] bg-white p-8 shadow-[0_24px_70px_rgba(47,36,28,0.10)] sm:p-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-brown-800">
                      {t('commentPage.fields.name')}
                    </span>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleChange('name')}
                      placeholder={t('commentPage.placeholders.name')}
                      className="w-full rounded-2xl border border-[#d8c4a7] bg-[#fffdf9] px-4 py-3 text-brown-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                    />
                  </label>

                  <div className="block">
                    <span className="mb-2 block text-sm font-semibold text-brown-800">
                      {t('commentPage.fields.rating')}
                    </span>
                    <div className="rounded-2xl border border-[#d8c4a7] bg-[#fffdf9] px-4 py-4">
                      <div
                        className="relative w-[220px] max-w-full"
                        onMouseLeave={() => setHoveredRating(null)}
                      >
                        <div className="pointer-events-none">
                          <Rating
                            style={{ maxWidth: 220 }}
                            value={visibleRating}
                            readOnly
                            halfFillMode="svg"
                            itemStyles={inputRatingStyles}
                          />
                        </div>

                        <div className="absolute inset-0 grid grid-cols-10">
                          {Array.from({ length: 10 }, (_, index) => {
                            const nextRating = (index + 1) / 2;

                            return (
                              <button
                                key={nextRating}
                                type="button"
                                aria-label={t('commentPage.selectRatingAria', {
                                  rating: formatRatingValue(nextRating),
                                })}
                                onMouseEnter={() => setHoveredRating(nextRating)}
                                onFocus={() => setHoveredRating(nextRating)}
                                onClick={() => {
                                  setFormData((current) => ({
                                    ...current,
                                    rating: nextRating,
                                  }));
                                  setHoveredRating(null);
                                }}
                                className="h-10 cursor-pointer bg-transparent focus:outline-none"
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((current) => ({
                                ...current,
                                rating: 0,
                              }));
                              setHoveredRating(null);
                            }}
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700 transition hover:text-gold-600"
                          >
                            {t('commentPage.clearSelection')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brown-800">
                    {t('commentPage.fields.comment')}
                  </span>
                  <textarea
                    rows={6}
                    value={formData.comment}
                    onChange={handleChange('comment')}
                    placeholder={t('commentPage.placeholders.comment')}
                    className="w-full rounded-3xl border border-[#d8c4a7] bg-[#fffdf9] px-4 py-3 text-brown-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                  />
                </label>

                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f1712] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={16} />
                  {isSubmitting ? t('commentPage.submitLoading') : t('commentPage.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Comment;
