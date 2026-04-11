import React, { useEffect, useState } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Rating, RoundedStar } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { CommentItem, getComments } from '../services/commentService';

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

const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadComments = async () => {
      setIsLoadingComments(true);
      setCommentsError(null);

      try {
        const nextComments = await getComments();

        if (!isCancelled) {
          setComments(nextComments);
        }
      } catch (error) {
        if (!isCancelled) {
          setComments([]);
          setCommentsError(error instanceof Error ? error.message : t('about.commentsLoadError'));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingComments(false);
        }
      }
    };

    void loadComments();

    return () => {
      isCancelled = true;
    };
  }, [t]);

  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
  const marqueeComments =
    comments.length === 1
      ? [...comments, ...comments, ...comments, ...comments]
      : comments.length === 2
        ? [...comments, ...comments, ...comments]
        : comments;
  const shouldAnimateComments = marqueeComments.length > 0;
  const animationDuration = `${Math.max(18, marqueeComments.length * 6)}s`;

  const formatCommentDate = (value?: string) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div>
      <style>{`
        @keyframes about-comments-marquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(calc(-50% - 0.625rem));
          }
        }
      `}</style>

      <div className="relative flex h-[50vh] items-center justify-center bg-brown-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://picsum.photos/1920/1080?random=10")' }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 animate-fade-in-up px-4 text-center">
          <h1 className="mb-4 text-5xl font-serif font-bold text-white drop-shadow-lg md:text-6xl">
            {t('about.heroTitle')}
          </h1>
          <div className="mx-auto h-1 w-24 bg-[#BFA15A]"></div>
          <p className="mt-4 text-lg font-bold uppercase tracking-wider text-[#BFA15A] drop-shadow-sm">
            {t('about.heroSubtitle')}
          </p>
        </div>
      </div>

      <div className="flex min-h-screen items-center bg-brown-50 py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-lg border-2 border-gold-500"></div>
              <img
                src="https://picsum.photos/600/800"
                alt={t('about.imageAlt')}
                className="relative h-[500px] w-full rounded-lg object-cover shadow-2xl"
              />
            </div>

            <div className="w-full space-y-6 md:w-1/2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold-600">
                {t('about.sectionEyebrow')}
              </h3>
              <h1 className="text-5xl font-serif font-bold leading-tight text-brown-900">
                {t('about.title')} <span className="text-gold-500">{t('about.titleAccent')}</span>
              </h1>
              <p className="text-lg leading-relaxed text-brown-700">{t('about.paragraphOne')}</p>
              <p className="leading-relaxed text-brown-600">{t('about.paragraphTwo')}</p>

              <div className="grid grid-cols-2 gap-4 border-t border-brown-200 pt-6">
                <div>
                  <span className="block text-3xl font-serif font-bold text-gold-600">14+</span>
                  <span className="text-sm uppercase tracking-wider text-brown-500">
                    {t('about.premiumRooms')}
                  </span>
                </div>
                <div>
                  <span className="block text-3xl font-serif font-bold text-gold-600">24/7</span>
                  <span className="text-sm uppercase tracking-wider text-brown-500">
                    {t('about.support')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden bg-[linear-gradient(180deg,#fff8ee_0%,#f5ede2_100%)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold-600">
              {t('about.commentsEyebrow')}
            </p>
            <h2 className="mt-4 text-4xl font-serif font-bold text-brown-900 sm:text-5xl">
              {t('about.commentsTitle')}
            </h2>
            <p className="mt-4 text-base leading-7 text-brown-600">{t('about.commentsSubtitle')}</p>
          </div>

          <div className="mt-10">
            {isLoadingComments && (
              <div className="rounded-[28px] border border-dashed border-[#d9c8b1] bg-white/70 px-6 py-10 text-center text-[#7a6149]">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b79252]" />
                <p className="mt-4 text-sm font-semibold">{t('about.commentsLoading')}</p>
              </div>
            )}

            {!isLoadingComments && commentsError && (
              <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 text-red-700">
                <p className="text-sm font-semibold">{commentsError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadingComments(true);
                    setCommentsError(null);
                    void getComments()
                      .then((nextComments) => {
                        setComments(nextComments);
                      })
                      .catch((error: unknown) => {
                        setComments([]);
                        setCommentsError(
                          error instanceof Error ? error.message : t('about.commentsLoadError'),
                        );
                      })
                      .finally(() => {
                        setIsLoadingComments(false);
                      });
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712]"
                >
                  <RefreshCw size={16} />
                  {t('about.commentsRetry')}
                </button>
              </div>
            )}

            {!isLoadingComments && !commentsError && comments.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-[#d9c8b1] bg-white/70 px-6 py-10 text-center text-[#7a6149]">
                <p className="text-sm font-semibold">{t('about.commentsEmpty')}</p>
              </div>
            )}

            {!isLoadingComments && !commentsError && shouldAnimateComments && (
              <div className="overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                <div
                  className="flex w-max gap-5"
                  style={{
                    animation: `about-comments-marquee ${animationDuration} linear infinite`,
                  }}
                >
                  {[0, 1].map((groupIndex) => (
                    <div key={groupIndex} className="flex shrink-0 gap-5">
                      {marqueeComments.map((comment, commentIndex) => {
                        const rating = Math.max(0, Math.min(5, Number(comment.rating) || 0));
                        return (
                          <article
                            key={`${groupIndex}-${comment.id}-${commentIndex}`}
                            className="flex w-[320px] shrink-0 flex-col rounded-[28px] border border-[#eadfce] bg-white/90 p-6 shadow-[0_18px_50px_rgba(47,36,28,0.08)] sm:w-[360px]"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={comment.avatar || createAvatarFallback(comment.name)}
                                  alt={t('about.commentsAvatarAlt', { name: comment.name })}
                                  onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = createAvatarFallback(comment.name);
                                  }}
                                  className="h-14 w-14 rounded-full border border-[#eadbc4] object-cover"
                                />
                                <div>
                                  <p className="text-lg font-bold text-brown-900">{comment.name}</p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-brown-500">
                                    {formatCommentDate(comment.createdAt)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ede2] text-[#b79252]">
                                <Quote size={18} />
                              </div>
                            </div>

                            <div className="mt-5 flex items-center gap-3">
                              <Rating
                                style={{ maxWidth: 110 }}
                                value={rating}
                                readOnly
                                halfFillMode="svg"
                                itemStyles={commentRatingStyles}
                              />
                              <span className="text-sm font-semibold text-brown-600">
                                {new Intl.NumberFormat(locale, {
                                  minimumFractionDigits: rating % 1 === 0 ? 0 : 1,
                                  maximumFractionDigits: 1,
                                }).format(rating)}
                                /5
                              </span>
                            </div>

                            <p className="mt-5 flex-1 text-sm leading-7 text-brown-700">
                              {comment.comment}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
