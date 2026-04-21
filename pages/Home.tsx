import React, { useState, useEffect } from "react";
import {
  Wifi,
  Droplets,
  Car,
  Sparkles,
  CheckCircle,
  Star,
  Quote,
  Navigation,
  Heart,
  CloudSun,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CommentItem, getComments } from "@/services/commentService";
import { Rating, RoundedStar } from "@smastrom/react-rating";

// FIX: Correctly typed the ServiceItem component using React.FC.
// This resolves a TypeScript error where the special `key` prop was being
// incorrectly checked against the component's own props, and aligns with
// the project's coding style for components.

const createAvatarFallback = (name: string): string =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="48" fill="#eadbc4"/>
      <text x="48" y="56" text-anchor="middle" fill="#8b7258" font-family="Arial, sans-serif" font-size="30" font-weight="700">
        ${name.trim().charAt(0).toUpperCase() || "G"}
      </text>
    </svg>`,
  );

const commentRatingStyles = {
  itemShapes: RoundedStar,
  itemStrokeWidth: 1.5,
  activeFillColor: "#c59f58",
  inactiveFillColor: "#efe4d3",
  activeStrokeColor: "#c59f58",
  inactiveStrokeColor: "#d9c4a4",
};

interface ServiceItemProps {
  item: { name: string; icon: React.ElementType };
}

const ServiceItem: React.FC<ServiceItemProps> = ({ item }) => (
  <div className="flex flex-col items-center group cursor-default">
    <item.icon
      strokeWidth={1.5}
      className="w-12 h-12 text-gold-500 mb-4 transition-all duration-300 transform group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
    />
    <h4 className="font-serif font-light text-brown-800 text-lg tracking-wide group-hover:text-gold-600 transition-colors">
      {item.name}
    </h4>
  </div>
);

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
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
          setCommentsError(
            error instanceof Error
              ? error.message
              : t("about.commentsLoadError"),
          );
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

  const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
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
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const heroImages = [
    "https://i.ibb.co/pv8s1mwf/6.png", // Ảnh 1: Tổng quan / Sảnh
    "https://i.ibb.co/HTTkgf26/2.png", // Ảnh 2: Phòng ngủ sang trọng
    "https://i.ibb.co/x8PTBPzc/1.png3", // Ảnh 3: Chi tiết nội thất
    "https://i.ibb.co/mFG3YVJ0/9.png", // Ảnh 4: Góc thư giãn
    "https://i.ibb.co/7JqQL3YC/4.png", // Ảnh 5: Góc thư giãn
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Chuyển ảnh mỗi 5 giây
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Split amenities into 2 rows as requested
  const amenitiesRow1 = [
    { name: t("home.amenityWifi"), icon: Wifi },
    { name: t("home.amenityWater"), icon: Droplets },
    { name: t("home.amenityClean"), icon: CheckCircle },
  ];

  const amenitiesRow2 = [
    { name: t("home.amenityParking"), icon: Car },
    { name: t("home.amenityDiffuser"), icon: Sparkles },
    { name: t("home.amenityRooftop"), icon: CloudSun },
    { name: t("home.amenityLoveChair"), icon: Heart },
  ];

  // Data for featured rooms, now with type/category for linking
  const featuredRooms = [
    {
      id: "206",
      name: t("home.suiteLuxury"),
      price: 550000,
      image: "https://i.ibb.co/jvyZRpTb/6.png",
      type: "Double",
      category: "VIP",
    },
    {
      id: "302",
      name: t("home.deluxeDouble"),
      price: 400000,
      image: "https://i.ibb.co/hRjS2GGL/6.png",
      type: "Double",
      category: "Standard",
    },
    {
      id: "301",
      name: t("home.gardenSingle"),
      price: 250000,
      image: "https://i.ibb.co/PvNb1jK4/4.png",
      type: "Single",
      category: "Standard",
    },
    {
      id: "207",
      name: t("home.vipSingle"),
      price: 350000,
      image: "https://i.ibb.co/9HnMww9P/4.png",
      type: "Single",
      category: "VIP",
    },
  ];

  const formatVndPrice = (price: number) =>
    new Intl.NumberFormat(i18n.language === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);

  // Mock data for visitors/reviews
  const visitors = [
    {
      id: 1,
      name: t("home.guestOne.name"),
      location: t("home.guestOne.location"),
      comment: t("home.guestOne.comment"),
      avatar: "https://picsum.photos/100/100?random=101",
    },
    {
      id: 2,
      name: t("home.guestTwo.name"),
      location: t("home.guestTwo.location"),
      comment: t("home.guestTwo.comment"),
      avatar: "https://picsum.photos/100/100?random=102",
    },
    {
      id: 3,
      name: t("home.guestThree.name"),
      location: t("home.guestThree.location"),
      comment: t("home.guestThree.comment"),
      avatar: "https://picsum.photos/100/100?random=103",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Slider */}
      <div className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-brown-900">
        {/* Background Images Layer */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-105"
                : "opacity-0 scale-100"
            }`}
            style={{
              backgroundImage: `url("${img}")`,
              transition: "opacity 1.5s ease-in-out, transform 6s ease-out",
            }}
          ></div>
        ))}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply z-10"></div>

        {/* Content */}
        <div className="relative z-20 text-center px-4 animate-fade-in-up">
          <h2 className="text-gold-400 font-sans tracking-[0.3em] text-sm md:text-lg mb-6 uppercase border-b border-gold-400/50 inline-block pb-2">
            {t("home.heroEyebrow")}
          </h2>
          <h1 className="text-4xl md:text-8xl font-serif text-white font-bold mb-8 drop-shadow-2xl leading-tight">
            {t("home.heroTitleLead")} <br />{" "}
            <span className="italic text-gold-500 font-light">
              {t("home.heroTitleAccent")}
            </span>
          </h1>
          {/* Buttons removed as requested */}
        </div>

        {/* Slider Navigation Dots */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/50 ${
                currentSlide === idx
                  ? "bg-gold-500 w-10 border-none"
                  : "bg-transparent hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 1. Featured Rooms Section - NEW DESIGN */}
      <div className="py-24 bg-brown-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-gold-600 uppercase tracking-widest text-sm font-bold mb-2">
              {t("home.featuredEyebrow")}
            </h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brown-900">
              {t("home.featuredTitle")}
            </h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredRooms.map((room) => (
              <Link
                key={room.id}
                to="/rooms"
                state={{ type: room.type, category: room.category }}
                className="block relative rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden group transform hover:-translate-y-2 transition-transform duration-500"
              >
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-96 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>

                <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/20">
                  <div>
                    <p className="text-xs text-brown-500 uppercase font-bold tracking-wider">
                      {t("home.featuredPrice", {
                        price: formatVndPrice(room.price),
                      })}
                    </p>
                    <h4 className="text-xl font-serif font-bold text-brown-900 mt-1">
                      {room.name}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-20">
            <Link
              to="/rooms"
              className="text-gold-600 uppercase font-bold tracking-[0.2em] hover:text-brown-800 transition group text-sm"
            >
              {t("home.allRooms")}
              <span className="block w-full h-0.5 bg-gold-400/50 mt-1 group-hover:bg-brown-800 transition"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Amenities Section */}
      <div className="py-24 bg-white border-y border-brown-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h3 className="text-gold-600 uppercase tracking-widest text-sm font-bold mb-2">
              {t("home.amenitiesEyebrow")}
            </h3>
            <h2 className="text-4xl font-serif font-bold text-brown-900">
              {t("home.amenitiesTitle")}
            </h2>
          </div>

          <div className="flex flex-col gap-12">
            {/* Row 1: Wifi, Water, Clean */}
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-10">
              {amenitiesRow1.map((item, idx) => (
                <ServiceItem key={`row1-${idx}`} item={item} />
              ))}
            </div>

            {/* Separator line for elegance (optional) */}
            <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent mx-auto opacity-50"></div>

            {/* Row 2: Car, Oil, Rooftop, Love Chair */}
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-10">
              {amenitiesRow2.map((item, idx) => (
                <ServiceItem key={`row2-${idx}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visitors / Testimonials Section */}
      <div className="mt-10" >
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
        {isLoadingComments && (
          <div className="rounded-[28px] border border-dashed border-[#d9c8b1] bg-white/70 px-6 py-10 text-center text-[#7a6149]">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b79252]" />
            <p className="mt-4 text-sm font-semibold">
              {t("about.commentsLoading")}
            </p>
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
                      error instanceof Error
                        ? error.message
                        : t("about.commentsLoadError"),
                    );
                  })
                  .finally(() => {
                    setIsLoadingComments(false);
                  });
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712]"
            >
              <RefreshCw size={16} />
              {t("about.commentsRetry")}
            </button>
          </div>
        )}

        {!isLoadingComments && !commentsError && comments.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-[#d9c8b1] bg-white/70 px-6 py-10 text-center text-[#7a6149]">
            <p className="text-sm font-semibold">{t("about.commentsEmpty")}</p>
          </div>
        )}

        {!isLoadingComments && !commentsError && shouldAnimateComments && (
          <div className="overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div
              className="flex w-max gap-5 pb-10"
              style={{
                animation: `about-comments-marquee ${animationDuration} linear infinite`,
              }}
            >
              {[0, 1].map((groupIndex) => (
                <div key={groupIndex} className="flex shrink-0 gap-5">
                  {marqueeComments.map((comment, commentIndex) => {
                    const rating = Math.max(
                      0,
                      Math.min(5, Number(comment.rating) || 0),
                    );
                    return (
                      <article
                        key={`${groupIndex}-${comment.id}-${commentIndex}`}
                        className="flex w-[320px] shrink-0 flex-col rounded-[28px] border border-[#eadfce] bg-white/90 p-6 shadow-[0_18px_50px_rgba(47,36,28,0.08)] sm:w-[360px]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                comment.avatar ||
                                createAvatarFallback(comment.name)
                              }
                              alt={t("about.commentsAvatarAlt", {
                                name: comment.name,
                              })}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = createAvatarFallback(
                                  comment.name,
                                );
                              }}
                              className="h-14 w-14 rounded-full border border-[#eadbc4] object-cover"
                            />
                            <div>
                              <p className="text-lg font-bold text-brown-900">
                                {comment.name}
                              </p>
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

      {/* 3. Visitors / Testimonials Section */}
      {/* Decorative Background Element */}
      {/* <div className="py-24 bg-brown-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brown-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-serif font-bold text-brown-900">{t('home.testimonialsTitle')}</h2>
             <div className="w-20 h-1 bg-gold-500 mx-auto mt-4"></div>
             <p className="text-brown-600 mt-4 italic">{t('home.testimonialsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visitors.map((visitor) => (
              <div key={visitor.id} className="bg-white p-8 rounded-2xl shadow-xl border border-brown-50 relative group hover:-translate-y-2 transition duration-300">
                <Quote className="absolute top-6 right-6 text-gold-200 w-10 h-10 group-hover:text-gold-400 transition" />
                
                <div className="flex items-center gap-4 mb-6">
                  <img src={visitor.avatar} alt={visitor.name} className="w-14 h-14 rounded-full object-cover border-2 border-gold-500 shadow-md" />
                  <div>
                    <h4 className="font-bold text-brown-900 text-lg">{visitor.name}</h4>
                    <span className="text-xs text-brown-500 uppercase tracking-wide font-bold">{visitor.location}</span>
                  </div>
                </div>
                
                <div className="flex mb-4 text-gold-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                
                <p className="text-brown-600 leading-relaxed italic border-t border-dashed border-brown-100 pt-4">
                  "{visitor.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* 4. Map Section */}
      <div className="w-full h-[500px] relative group">
        <a
          href="https://maps.app.goo.gl/haDDzx9cyGYPmKvU7"
          target="_blank"
          rel="noreferrer"
          className="block w-full h-full relative"
          title={t("home.mapLinkTitle")}
        >
          {/* Overlay for better interaction */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 flex items-center gap-3 text-brown-900 font-bold border-2 border-gold-500">
              <Navigation className="text-gold-600 animate-bounce" size={24} />
              <span className="text-lg">{t("home.mapDirections")}</span>
            </div>
          </div>

          <iframe
            src="https://maps.google.com/maps?q=Hiền+Phương+Motel+Duy+Xuyên&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, pointerEvents: "none" }} // Disable pointer events so the anchor tag catches the click
            allowFullScreen={false}
            loading="lazy"
            title={t("home.mapIframeTitle")}
            className="w-full h-full grayscale-[20%] group-hover:grayscale-0 transition duration-500"
          ></iframe>
        </a>
      </div>
    </div>
  );
};

export default Home;
