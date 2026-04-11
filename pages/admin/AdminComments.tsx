import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquareQuote,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Rating, RoundedStar } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import {
  CommentItem,
  CreateCommentPayload,
  deleteComment,
  getComments,
  updateComment,
} from '../../services/commentService';

const createAvatarFallback = (name: string): string =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="48" fill="#eadbc4"/>
      <text x="48" y="56" text-anchor="middle" fill="#8b7258" font-family="Arial, sans-serif" font-size="30" font-weight="700">
        ${name.trim().charAt(0).toUpperCase() || 'G'}
      </text>
    </svg>`,
  );

const commentRatingStyles = {
  itemShapes: RoundedStar,
  itemStrokeWidth: 1.5,
  activeFillColor: '#c59f58',
  inactiveFillColor: '#efe4d3',
  activeStrokeColor: '#c59f58',
  inactiveStrokeColor: '#d9c4a4',
};

interface CommentFormState {
  name: string;
  rating: number;
  comment: string;
}

const createFormState = (comment: CommentItem | null): CommentFormState => ({
  name: comment?.name ?? '',
  rating: Number(comment?.rating) || 5,
  comment: comment?.comment ?? '',
});

const formatRatingValue = (value: number) => (value % 1 === 0 ? String(value) : value.toFixed(1));

const AdminComments: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingComment, setEditingComment] = useState<CommentItem | null>(null);
  const [commentPendingDelete, setCommentPendingDelete] = useState<CommentItem | null>(null);
  const [formState, setFormState] = useState<CommentFormState>(createFormState(null));
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
  const visibleRating = hoveredRating ?? formState.rating;

  const loadComments = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextComments = await getComments();
      setComments(nextComments);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : t('admin.comments.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, []);

  useEffect(() => {
    if ((!editingComment && !commentPendingDelete) || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editingComment, commentPendingDelete]);

  const filteredComments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return comments.filter((comment) => {
      if (!keyword) {
        return true;
      }

      return (
        comment.name.toLowerCase().includes(keyword) ||
        comment.comment.toLowerCase().includes(keyword) ||
        String(comment.rating).includes(keyword)
      );
    });
  }, [comments, search]);

  const averageRating = comments.length
    ? comments.reduce((sum, comment) => sum + (Number(comment.rating) || 0), 0) / comments.length
    : 0;
  const positiveComments = comments.filter((comment) => (Number(comment.rating) || 0) >= 4).length;
  const latestCommentDate = comments.reduce<string | undefined>((latest, comment) => {
    if (!comment.createdAt) {
      return latest;
    }

    if (!latest) {
      return comment.createdAt;
    }

    return new Date(comment.createdAt).getTime() > new Date(latest).getTime()
      ? comment.createdAt
      : latest;
  }, undefined);

  const formatDateTime = (value?: string) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const formatRating = (value: number | undefined) => {
    const rating = Number(value) || 0;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: rating % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    }).format(rating);
  };

  const openEditModal = (comment: CommentItem) => {
    setEditingComment(comment);
    setFormState(createFormState(comment));
    setFormError(null);
    setHoveredRating(null);
  };

  const closeEditModal = (force = false) => {
    if (isSaving && !force) {
      return;
    }

    setEditingComment(null);
    setFormState(createFormState(null));
    setFormError(null);
    setHoveredRating(null);
  };

  const openDeleteDialog = (comment: CommentItem) => {
    setCommentPendingDelete(comment);
    setDeleteError(null);
  };

  const closeDeleteDialog = (force = false) => {
    if (isDeleting && !force) {
      return;
    }

    setCommentPendingDelete(null);
    setDeleteError(null);
  };

  const updateFormField = <K extends keyof CommentFormState>(field: K, value: CommentFormState[K]) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const buildPayload = (): CreateCommentPayload | null => {
    const normalizedName = formState.name.trim();
    const normalizedComment = formState.comment.trim();
    const normalizedRating = Number(formState.rating);

    if (!normalizedName || !normalizedComment) {
      setFormError(t('admin.comments.formErrorRequired'));
      return null;
    }

    if (!Number.isFinite(normalizedRating) || normalizedRating < 0 || normalizedRating > 5) {
      setFormError(t('admin.comments.formErrorRating'));
      return null;
    }

    return {
      name: normalizedName,
      rating: normalizedRating,
      comment: normalizedComment,
    };
  };

  const handleSubmitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingComment) {
      return;
    }

    setFormError(null);
    const payload = buildPayload();

    if (!payload) {
      return;
    }

    setIsSaving(true);

    try {
      await updateComment(editingComment.id, payload);
      closeEditModal(true);
      await loadComments();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('admin.comments.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentPendingDelete) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteComment(commentPendingDelete.id);
      closeDeleteDialog(true);
      await loadComments();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : t('admin.comments.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#e1d4c0] bg-white/80 p-6 shadow-[0_25px_80px_rgba(47,36,28,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4c2a9] bg-[#fff6e8] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7d58]">
              <Sparkles size={14} />
              {t('admin.comments.eyebrow')}
            </div>
            <h2 className="mt-5 text-3xl font-serif font-bold text-[#2f241c] sm:text-4xl">
              {t('admin.comments.title')}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f5a46] sm:text-base">
              {t('admin.comments.subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadComments()}
            className="inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712]"
          >
            <RefreshCw size={16} />
            {t('admin.comments.retry')}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: t('admin.comments.stats.total'),
            value: comments.length,
          },
          {
            label: t('admin.comments.stats.average'),
            value: `${formatRating(averageRating)}/5`,
          },
          {
            label: t('admin.comments.stats.positive'),
            value: positiveComments,
          },
          {
            label: t('admin.comments.stats.latest'),
            value: latestCommentDate ? formatDateTime(latestCommentDate) : '-',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[28px] border border-[#e1d4c0] bg-white/85 p-5 shadow-[0_20px_60px_rgba(47,36,28,0.06)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">{stat.label}</p>
            <p className="mt-4 break-words text-2xl font-serif font-bold text-[#2f241c] sm:text-3xl">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[32px] border border-[#e1d4c0] bg-white/85 p-5 shadow-[0_20px_60px_rgba(47,36,28,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
              {t('admin.comments.table.title')}
            </p>
            <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
              {t('admin.comments.table.subtitle')}
            </h3>
          </div>

          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7d58]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('admin.comments.searchPlaceholder')}
              className="w-full rounded-full border border-[#d7c8b5] bg-[#fffaf3] py-3 pl-11 pr-4 text-sm text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-2 focus:ring-[#f2dfbf]"
            />
          </label>
        </div>

        <div className="mt-6">
          {isLoading && (
            <div className="rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b79252]" />
              <p className="mt-4 text-sm font-semibold">{t('admin.comments.loading')}</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 text-red-700">
              <p className="text-sm font-semibold">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadComments()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712]"
              >
                <RefreshCw size={16} />
                {t('admin.comments.retry')}
              </button>
            </div>
          )}

          {!isLoading && !loadError && filteredComments.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
              <p className="text-sm font-semibold">{t('admin.comments.empty')}</p>
            </div>
          )}

          {!isLoading && !loadError && filteredComments.length > 0 && (
            <>
              <div className="hidden overflow-hidden rounded-[28px] border border-[#eadfce] lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#eadfce]">
                    <thead className="bg-[#fff8ee]">
                      <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                        <th className="px-6 py-4">{t('admin.comments.table.guest')}</th>
                        <th className="px-6 py-4">{t('admin.comments.table.rating')}</th>
                        <th className="px-6 py-4">{t('admin.comments.table.comment')}</th>
                        <th className="px-6 py-4">{t('admin.comments.table.created')}</th>
                        <th className="px-6 py-4">{t('admin.comments.table.updated')}</th>
                        <th className="px-6 py-4">{t('admin.comments.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1e7d8] bg-white/95">
                      {filteredComments.map((comment) => {
                        const rating = Math.max(0, Math.min(5, Number(comment.rating) || 0));

                        return (
                          <tr key={comment.id} className="align-top text-sm text-[#4e3d31]">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <img
                                  src={comment.avatar || createAvatarFallback(comment.name)}
                                  alt={t('about.commentsAvatarAlt', { name: comment.name })}
                                  onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = createAvatarFallback(comment.name);
                                  }}
                                  className="h-12 w-12 rounded-full border border-[#eadbc4] object-cover"
                                />
                                <div>
                                  <p className="font-semibold text-[#2f241c]">{comment.name}</p>
                                  <p className="mt-1 text-xs text-[#8b7258]">{comment.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex min-w-[160px] items-center gap-3">
                                <Rating
                                  style={{ maxWidth: 100 }}
                                  value={rating}
                                  readOnly
                                  halfFillMode="svg"
                                  itemStyles={commentRatingStyles}
                                />
                                <span className="font-semibold text-[#2f241c]">{formatRating(rating)}/5</span>
                              </div>
                            </td>
                            <td className="max-w-xl px-6 py-5">
                              <p className="line-clamp-4 leading-7 text-[#6f5a46]">{comment.comment}</p>
                            </td>
                            <td className="px-6 py-5 text-[#6f5a46]">{formatDateTime(comment.createdAt)}</td>
                            <td className="px-6 py-5 text-[#6f5a46]">{formatDateTime(comment.updatedAt)}</td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(comment)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#d8c4a7] px-3 py-2 text-xs font-semibold text-[#2f241c] transition hover:border-[#c59f58] hover:bg-[#fff6e8]"
                                >
                                  <Pencil size={14} />
                                  {t('admin.comments.edit')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteDialog(comment)}
                                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                  {t('admin.comments.delete')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 lg:hidden">
                {filteredComments.map((comment) => {
                  const rating = Math.max(0, Math.min(5, Number(comment.rating) || 0));

                  return (
                    <article
                      key={comment.id}
                      className="rounded-[28px] border border-[#eadfce] bg-[#fffdf9] p-5 shadow-[0_18px_45px_rgba(47,36,28,0.06)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={comment.avatar || createAvatarFallback(comment.name)}
                            alt={t('about.commentsAvatarAlt', { name: comment.name })}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = createAvatarFallback(comment.name);
                            }}
                            className="h-12 w-12 rounded-full border border-[#eadbc4] object-cover"
                          />
                          <div>
                            <p className="font-semibold text-[#2f241c]">{comment.name}</p>
                            <p className="mt-1 text-xs text-[#8b7258]">{formatDateTime(comment.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ede2] text-[#b79252]">
                          <MessageSquareQuote size={18} />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <Rating
                          style={{ maxWidth: 100 }}
                          value={rating}
                          readOnly
                          halfFillMode="svg"
                          itemStyles={commentRatingStyles}
                        />
                        <span className="font-semibold text-[#2f241c]">{formatRating(rating)}/5</span>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-[#6f5a46]">{comment.comment}</p>

                      <div className="mt-4 grid gap-3 rounded-2xl bg-[#f7efe4] p-4 text-sm text-[#6f5a46]">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold text-[#8b7258]">{t('admin.comments.table.created')}</span>
                          <span>{formatDateTime(comment.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold text-[#8b7258]">{t('admin.comments.table.updated')}</span>
                          <span>{formatDateTime(comment.updatedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(comment)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d8c4a7] px-4 py-2 text-xs font-semibold text-[#2f241c] transition hover:border-[#c59f58] hover:bg-[#fff6e8]"
                        >
                          <Pencil size={14} />
                          {t('admin.comments.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(comment)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          {t('admin.comments.delete')}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>

      {editingComment && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1f1712]/60 px-4 py-8 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-[#e1d4c0] bg-white p-6 shadow-[0_30px_100px_rgba(31,23,18,0.28)] sm:p-8">
            <button
              type="button"
              onClick={() => closeEditModal()}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e1d4c0] text-[#7a6149] transition hover:bg-[#fff6e8] hover:text-[#2f241c]"
              aria-label={t('admin.comments.close')}
            >
              <X size={18} />
            </button>

            <div className="pr-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7d58]">
                {t('admin.comments.formEyebrow')}
              </p>
              <h3 className="mt-3 text-3xl font-serif font-bold text-[#2f241c]">
                {t('admin.comments.editTitle')}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6f5a46]">
                {t('admin.comments.formSubtitle')}
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmitComment}>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2f241c]">
                    {t('admin.comments.fields.name')}
                  </span>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(event) => updateFormField('name', event.target.value)}
                    placeholder={t('admin.comments.placeholders.name')}
                    className="w-full rounded-2xl border border-[#d7c8b5] bg-[#fffaf3] px-4 py-3 text-sm text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-2 focus:ring-[#f2dfbf]"
                  />
                </label>

                <div className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2f241c]">
                    {t('admin.comments.fields.rating')}
                  </span>
                  <div className="rounded-2xl border border-[#d7c8b5] bg-[#fffaf3] px-4 py-4">
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
                          itemStyles={commentRatingStyles}
                        />
                      </div>

                      <div className="absolute inset-0 grid grid-cols-10">
                        {Array.from({ length: 10 }, (_, index) => {
                          const nextRating = (index + 1) / 2;

                          return (
                            <button
                              key={nextRating}
                              type="button"
                              aria-label={`${t('admin.comments.fields.rating')} ${formatRatingValue(nextRating)}`}
                              onMouseEnter={() => setHoveredRating(nextRating)}
                              onFocus={() => setHoveredRating(nextRating)}
                              onClick={() => {
                                updateFormField('rating', nextRating);
                                setHoveredRating(null);
                              }}
                              className="h-10 cursor-pointer bg-transparent focus:outline-none"
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#6f5a46]">{t('admin.comments.ratingHelper')}</span>
                      <span className="font-semibold text-[#2f241c]">{formatRating(visibleRating)}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#2f241c]">
                  {t('admin.comments.fields.comment')}
                </span>
                <textarea
                  rows={6}
                  value={formState.comment}
                  onChange={(event) => updateFormField('comment', event.target.value)}
                  placeholder={t('admin.comments.placeholders.comment')}
                  className="w-full rounded-3xl border border-[#d7c8b5] bg-[#fffaf3] px-4 py-3 text-sm leading-7 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-2 focus:ring-[#f2dfbf]"
                />
              </label>

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => closeEditModal()}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] px-4 py-2 text-sm font-semibold text-[#5f4b3a] transition hover:border-[#c59f58] hover:text-[#2f241c]"
                >
                  {t('admin.comments.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f1712] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Pencil size={16} />
                  {isSaving ? t('admin.comments.savingUpdate') : t('admin.comments.saveUpdate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {commentPendingDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1f1712]/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-[#e1d4c0] bg-white p-6 shadow-[0_30px_100px_rgba(31,23,18,0.28)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7d58]">
                  {t('admin.comments.eyebrow')}
                </p>
                <h3 className="mt-3 text-3xl font-serif font-bold text-[#2f241c]">
                  {t('admin.comments.deleteTitle')}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => closeDeleteDialog()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e1d4c0] text-[#7a6149] transition hover:bg-[#fff6e8] hover:text-[#2f241c]"
                aria-label={t('admin.comments.close')}
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#6f5a46]">
              {t('admin.comments.deleteDescription', { name: commentPendingDelete.name })}
            </p>

            <div className="mt-5 rounded-2xl bg-[#fff8ee] p-4 text-sm leading-7 text-[#6f5a46]">
              <p>
                <span className="font-semibold text-[#2f241c]">{t('admin.comments.fields.name')}:</span>{' '}
                {commentPendingDelete.name}
              </p>
              <p>
                <span className="font-semibold text-[#2f241c]">{t('admin.comments.fields.rating')}:</span>{' '}
                {formatRating(commentPendingDelete.rating)}/5
              </p>
            </div>

            {deleteError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeDeleteDialog()}
                className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] px-4 py-2 text-sm font-semibold text-[#5f4b3a] transition hover:border-[#c59f58] hover:text-[#2f241c]"
              >
                {t('admin.comments.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteComment()}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {isDeleting ? t('admin.comments.deleting') : t('admin.comments.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminComments;
