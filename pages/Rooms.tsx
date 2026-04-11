import React, { useState, useEffect } from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Phone, Check, Crown, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Room, RoomAvailabilityPayload, RoomAvailabilityResponse } from '../types';
import { getRooms, hasRoomsApiUrl } from '../services/roomService';

type DatePickerValue = Date | null | [Date | null, Date | null];

const defaultAvailabilityDate = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatApiDate = (value: Date | null): string | null => {
  if (!value || Number.isNaN(value.getTime())) {
    return null;
  }

  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const extractRoomAvailabilityResponse = (
  payload: RoomAvailabilityPayload | null
): RoomAvailabilityResponse | null => {
  if (!payload || Array.isArray(payload)) {
    return null;
  }

  if ('data' in payload) {
    return Array.isArray(payload.data) ? null : payload.data;
  }

  return payload;
};

const extractRoomsFromPayload = (payload: RoomAvailabilityPayload | null): Room[] => {
  const response = extractRoomAvailabilityResponse(payload);
  if (response) {
    return response.rooms ?? [];
  }

  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return 'data' in payload && Array.isArray(payload.data) ? payload.data : [];
};

const normalizeRoomType = (type: string | undefined): 'Single' | 'Double' => {
  const normalizedType = type?.trim().toLowerCase();
  return normalizedType === 'double' ? 'Double' : 'Single';
};

const normalizeRoomCategory = (category: string | undefined): 'Standard' | 'VIP' => {
  const normalizedCategory = category?.trim().toLowerCase();
  return normalizedCategory === 'vip' ? 'VIP' : 'Standard';
};

const normalizeBookingStatus = (status: string | undefined): 'available' | 'booked' => {
  const normalizedStatus = status?.trim().toLowerCase();
  return normalizedStatus === 'booked' ? 'booked' : 'available';
};

const getRoomFallbackImage = (roomId: string) => `https://picsum.photos/600/400?random=${roomId}`;

const getRoomGalleryImages = (room: Room): string[] => {
  const nextImages = [room.thumbnail, ...(room.images ?? [])].filter(
    (image): image is string => Boolean(image?.trim())
  );

  if (nextImages.length === 0) {
    return [getRoomFallbackImage(room.id)];
  }

  return Array.from(new Set(nextImages));
};

const Rooms: React.FC = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [roomsPayload, setRoomsPayload] = useState<RoomAvailabilityPayload | null>(null);
  const [isLoading, setIsLoading] = useState(hasRoomsApiUrl);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [hasResolvedInitialFilters, setHasResolvedInitialFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultAvailabilityDate);
  const [previewRoom, setPreviewRoom] = useState<Room | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  
  // Split filters into two separate states for combined filtering
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Single' | 'Double'>('ALL');
  const [rankFilter, setRankFilter] = useState<'ALL' | 'Standard' | 'VIP'>('ALL');
  const initialState = location.state as { type: 'Single' | 'Double', category: 'Standard' | 'VIP' } | null;
  const selectedApiDate = formatApiDate(selectedDate);

  useEffect(() => {
    if (!hasRoomsApiUrl) {
      setIsLoading(false);
      setLoadError(null);
      setRoomsPayload(null);
      return;
    }

    if (!selectedApiDate) {
      setIsLoading(false);
      setLoadError(null);
      setRoomsPayload(null);
      return;
    }

    let isCancelled = false;

    const loadRooms = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextResponse = await getRooms(selectedApiDate);

        if (!isCancelled) {
          setRoomsPayload(nextResponse);
        }
      } catch (error) {
        console.error('Failed to load rooms:', error);
        if (!isCancelled) {
          setRoomsPayload(null);
          setLoadError(error instanceof Error ? error.message : 'Failed to load rooms.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadRooms();

    return () => {
      isCancelled = true;
    };
  }, [reloadKey, selectedApiDate]);

  const generateRooms = (): Room[] => {
    const rooms: Room[] = [];
    const floors = [2, 3];
    floors.forEach(floor => {
      for (let i = 1; i <= 7; i++) {
        const number = `${floor}0${i}`;
        
        // Logic giả lập: 
        // Phòng số chẵn là Phòng Đôi, Lẻ là Phòng Đơn
        // Phòng có đuôi 5, 6, 7 là phòng VIP
        const isDouble = i % 2 === 0;
        const isVip = i >= 5; 
        
        let price = 0;
        let description = '';

        if (isDouble) {
            price = isVip ? 550000 : 400000;
            description = isVip 
                ? t('rooms.descriptions.doubleVip') 
                : t('rooms.descriptions.doubleStandard');
        } else {
            price = isVip ? 350000 : 250000;
            description = isVip 
                ? t('rooms.descriptions.singleVip') 
                : t('rooms.descriptions.singleStandard');
        }

        rooms.push({
          id: number,
          name: `Room ${number}`,
          type: isDouble ? 'Double' : 'Single',
          category: isVip ? 'VIP' : 'Standard',
          price,
          description: description,
          booking_status: 'available',
        });
      }
    });
    return rooms;
  };

  const apiRooms = extractRoomsFromPayload(roomsPayload);
  const availabilityResponse = extractRoomAvailabilityResponse(roomsPayload);
  const rooms = hasRoomsApiUrl ? apiRooms : generateRooms();

  useEffect(() => {
    if (hasResolvedInitialFilters) {
      return;
    }

    if (!initialState) {
      setHasResolvedInitialFilters(true);
      return;
    }

    if (!hasRoomsApiUrl) {
      setTypeFilter(initialState.type);
      setRankFilter(initialState.category);
      setHasResolvedInitialFilters(true);
      return;
    }

    if (!roomsPayload) {
      return;
    }

    const hasMatchingRoom = apiRooms.some(
      (room) =>
        normalizeRoomType(room.type) === initialState.type &&
        normalizeRoomCategory(room.category) === initialState.category
    );

    if (hasMatchingRoom) {
      setTypeFilter(initialState.type);
      setRankFilter(initialState.category);
    } else {
      setTypeFilter('ALL');
      setRankFilter('ALL');
    }

    setHasResolvedInitialFilters(true);
  }, [apiRooms, hasResolvedInitialFilters, hasRoomsApiUrl, initialState, roomsPayload]);

  useEffect(() => {
    if (!previewRoom || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewRoom(null);
        return;
      }

      const previewImages = getRoomGalleryImages(previewRoom);

      if (event.key === 'ArrowRight' && previewImages.length > 1) {
        setPreviewImageIndex((current) => (current + 1) % previewImages.length);
      }

      if (event.key === 'ArrowLeft' && previewImages.length > 1) {
        setPreviewImageIndex((current) => (current - 1 + previewImages.length) % previewImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewRoom]);

  // Updated filtering logic to respect both filters
  const filteredRooms = rooms.filter(room => {
      const roomType = normalizeRoomType(room.type);
      const roomCategory = normalizeRoomCategory(room.category);
      const matchType = typeFilter === 'ALL' || roomType === typeFilter;
      const matchRank = rankFilter === 'ALL' || roomCategory === rankFilter;
      return matchType && matchRank;
  });

  const formatPrice = (price: number) => `${new Intl.NumberFormat('vi-VN').format(price)} VNĐ`;

  const formatForeignPrice = (price: number | undefined, currency: 'USD' | 'EUR') => {
    if (typeof price !== 'number') {
      return null;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleDateChange = (value: DatePickerValue) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    setSelectedDate(nextValue);
  };

  const formatDisplayDate = (value: Date | null) => {
    if (!value || Number.isNaN(value.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(value);
  };

  const getRoomTypeBadge = (type: string) =>
    normalizeRoomType(type) === 'Double' ? t('rooms.typeBadge.double') : t('rooms.typeBadge.single');

  const getRoomCategoryBadge = (category: string) =>
    normalizeRoomCategory(category) === 'VIP' ? t('rooms.categoryBadge.vip') : t('rooms.filters.standard');

  const getRoomStatusMeta = (status: string | undefined) =>
    normalizeBookingStatus(status) === 'booked'
      ? {
          label: t('rooms.status.booked'),
          className: 'border-red-200 bg-red-50 text-red-700',
        }
      : {
          label: t('rooms.status.available'),
          className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        };

  const openPreview = (room: Room) => {
    setPreviewRoom(room);
    setPreviewImageIndex(0);
  };

  const closePreview = () => {
    setPreviewRoom(null);
    setPreviewImageIndex(0);
  };

  const showPreviousPreviewImage = () => {
    if (!previewRoom) {
      return;
    }

    const previewImages = getRoomGalleryImages(previewRoom);
    setPreviewImageIndex((current) => (current - 1 + previewImages.length) % previewImages.length);
  };

  const showNextPreviewImage = () => {
    if (!previewRoom) {
      return;
    }

    const previewImages = getRoomGalleryImages(previewRoom);
    setPreviewImageIndex((current) => (current + 1) % previewImages.length);
  };

  const FilterGroup = ({ title, options, current, onChange }: { 
    title: string, 
    options: { label: string, value: string }[], 
    current: string, 
    onChange: (val: any) => void 
  }) => (
    <div className="flex flex-col items-center md:items-start gap-2">
      <span className="text-xs font-bold text-brown-400 uppercase tracking-widest">{title}</span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
                px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 border
                ${current === opt.value
                    ? 'bg-brown-800 text-white border-brown-800 shadow-md' 
                    : 'bg-white text-brown-600 border-brown-200 hover:border-gold-500 hover:text-gold-600'
                }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const previewImages = previewRoom ? getRoomGalleryImages(previewRoom) : [];
  const activePreviewImage = previewImages[previewImageIndex] ?? null;

  return (
    <>
    <div>
      {/* Hero Banner */}
      <div className="relative h-[50vh] flex items-center justify-center bg-brown-900">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://picsum.photos/1920/1080?random=12")' }}></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center animate-fade-in-up px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">{t('rooms.heroTitle')}</h1>
          <div className="w-24 h-1 bg-[#BFA15A] mx-auto"></div>
          <p className="text-[#BFA15A] mt-4 text-lg tracking-wider uppercase font-bold drop-shadow-sm">{t('rooms.heroSubtitle')}</p>
        </div>
      </div>

      <div className="py-20 bg-brown-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Contact Bar */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-16">
            <p className="text-brown-600 italic">{t('rooms.contactBar')}</p>
            <div className="flex gap-4">
              <a href="tel:0345011468" className="inline-flex items-center gap-2 bg-white border border-gold-500 text-gold-600 px-5 py-2 rounded-full font-bold hover:bg-gold-500 hover:text-white transition shadow-sm">
                <Phone size={16} /> 0345 011 468
              </a>
              <a href="tel:0377586258" className="inline-flex items-center gap-2 bg-brown-800 text-white px-5 py-2 rounded-full font-bold hover:bg-brown-900 transition shadow-sm">
                <Phone size={16} /> 0377 586 258
              </a>
            </div>
          </div>

          {!hasRoomsApiUrl && (
            <div className="mb-8 rounded-2xl border border-gold-200 bg-gold-50 px-6 py-4 text-sm font-medium text-brown-700">
              {t('rooms.demoNotice')}
            </div>
          )}

          {hasRoomsApiUrl && loadError && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-brown-800">
              <p className="text-lg font-bold">{t('rooms.errorTitle')}</p>
              <p className="mt-2 text-sm text-brown-600">{t('rooms.errorDescription')}</p>
              <p className="mt-3 break-all rounded-lg bg-white/70 px-3 py-2 font-mono text-xs text-brown-500">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
                className="mt-4 inline-flex rounded-lg bg-brown-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-brown-800"
              >
                {t('rooms.retry')}
              </button>
            </div>
          )}

          {/* Filters Area */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-brown-100 mb-12 max-w-5xl mx-auto">
             <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-bold text-gold-600 uppercase tracking-[0.2em]">
                      {t('rooms.datePicker.title')}
                    </p>
                    <h2 className="mt-2 text-2xl font-serif font-bold text-brown-900">
                      {formatDisplayDate(selectedDate)}
                    </h2>
                    <p className="mt-2 text-sm text-brown-500">
                      {t('rooms.datePicker.helper')}
                    </p>
                  </div>

                  <div className="w-full lg:max-w-xs">
                    <label className="mb-2 block text-xs font-bold text-brown-400 uppercase tracking-widest">
                      {t('rooms.datePicker.inputLabel')}
                    </label>
                    <div className="rounded-xl border border-brown-200 bg-brown-50 px-4 py-3 shadow-sm">
                      <DatePicker
                        onChange={handleDateChange}
                        value={selectedDate}
                        clearIcon={null}
                        calendarIcon={<CalendarDays size={18} className="text-gold-600" />}
                        className="w-full text-brown-900"
                        format="dd/MM/y"
                        locale={i18n.language === 'vi' ? 'vi-VN' : 'en-US'}
                      />
                    </div>
                  </div>
                </div>

                {availabilityResponse?.summary && (
                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-full border border-brown-200 bg-brown-50 px-4 py-2 text-sm font-semibold text-brown-700">
                      {t('rooms.summary.total')}: {availabilityResponse.summary.total_rooms}
                    </div>
                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                      {t('rooms.summary.available')}: {availabilityResponse.summary.available_rooms}
                    </div>
                    <div className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                      {t('rooms.summary.booked')}: {availabilityResponse.summary.booked_rooms}
                    </div>
                  </div>
                )}

                <div className="h-px bg-brown-100"></div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                <FilterGroup 
                  title={t('rooms.filters.bedType')}
                  current={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { label: t('rooms.filters.all'), value: 'ALL' },
                    { label: t('rooms.filters.single'), value: 'Single' },
                    { label: t('rooms.filters.double'), value: 'Double' },
                  ]}
                />
                <div className="hidden md:block w-px h-12 bg-brown-200"></div>
                <FilterGroup 
                  title={t('rooms.filters.roomClass')}
                  current={rankFilter}
                  onChange={setRankFilter}
                  options={[
                    { label: t('rooms.filters.all'), value: 'ALL' },
                    { label: t('rooms.filters.standard'), value: 'Standard' },
                    { label: t('rooms.filters.vip'), value: 'VIP' },
                  ]}
                />
                </div>
             </div>
          </div>

          {/* Room Grid */}
          {isLoading && hasRoomsApiUrl && !roomsPayload && (
            <div className="mb-10 rounded-2xl border border-brown-100 bg-white px-6 py-12 text-center shadow-lg">
              <p className="text-2xl font-serif font-bold text-brown-900">{t('rooms.loadingTitle')}</p>
              <p className="mt-3 text-brown-500">{t('rooms.loadingDescription')}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-brown-100 hover:shadow-2xl transition duration-500 group flex flex-col h-full transform hover:-translate-y-2">
                
                {/* Image Area */}
                <div className="h-64 overflow-hidden relative">
                  <button
                    type="button"
                    onClick={() => openPreview(room)}
                    className="relative block h-full w-full overflow-hidden text-left"
                    aria-label={t('rooms.previewAria', { roomName: room.name })}
                  >
                    <img 
                      src={room.thumbnail || room.images?.[0] || getRoomFallbackImage(room.id)} 
                      alt={t('rooms.photoAlt', { roomName: room.name })} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1f1712]/10 opacity-0 transition duration-300 group-hover:bg-[#1f1712]/45 group-hover:opacity-100">
                      <span className="rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                        {t('rooms.preview')}
                      </span>
                    </div>
                  </button>
                  {normalizeRoomCategory(room.category) === 'VIP' && (
                    <div className="absolute top-4 right-4 bg-gold-500/90 backdrop-blur text-white p-2 rounded-full shadow-lg animate-pulse">
                      <Crown size={20} fill="currentColor" />
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-grow">
                  
                  {/* 1. [ LOẠI PHÒNG ] - Small, Uppercase, Gold */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="text-xs font-bold text-gold-600 tracking-[0.2em] uppercase border border-gold-200 px-3 py-1 rounded-full bg-gold-50">
                      {getRoomTypeBadge(room.type)} • {getRoomCategoryBadge(room.category)}
                    </span>
                    <span className={`text-xs font-bold tracking-[0.2em] uppercase border px-3 py-1 rounded-full ${getRoomStatusMeta(room.booking_status).className}`}>
                      {getRoomStatusMeta(room.booking_status).label}
                    </span>
                  </div>

                  {/* 2. Tên phòng - Large, Serif, Bold */}
                  <h3 className="text-3xl font-serif font-bold text-brown-900 mb-2 group-hover:text-gold-600 transition-colors">
                    {room.name}
                  </h3>

                  {/* 3. Giá - Nổi bật */}
                  <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-brown-800">{formatPrice(room.price)}</span>
                      <span className="text-sm text-brown-500 font-light">{t('rooms.perNight')}</span>
                  </div>

                  {(typeof room.usdPrice === 'number' || typeof room.euroPrice === 'number') && (
                    <div className="mb-6 rounded-xl border border-brown-100 bg-brown-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brown-400">
                        {t('rooms.internationalRates')}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold text-brown-700">
                        {typeof room.usdPrice === 'number' && (
                          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                            {formatForeignPrice(room.usdPrice, 'USD')}
                          </span>
                        )}
                        {typeof room.euroPrice === 'number' && (
                          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                            {formatForeignPrice(room.euroPrice, 'EUR')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. Mô tả ngắn */}
                  <div className="flex-grow">
                    <p className="text-brown-600 text-sm leading-relaxed mb-6 border-l-2 border-brown-200 pl-4 italic">
                        {room.description}
                    </p>
                    
                    {/* List amenities small for context */}
                    <div className="flex gap-3 mb-6 text-brown-400 text-xs">
                       <span className="flex items-center gap-1"><Check size={12} className="text-gold-500" /> {t('rooms.amenities.wifi')}</span>
                       <span className="flex items-center gap-1"><Check size={12} className="text-gold-500" /> {t('rooms.amenities.tv')}</span>
                       <span className="flex items-center gap-1"><Check size={12} className="text-gold-500" /> {t('rooms.amenities.ac')}</span>
                    </div>
                  </div>

                  {/* 5. Nút đặt phòng */}
                  <Link 
                    to="/reservation" 
                    className="w-full py-4 bg-brown-900 text-white font-bold rounded-lg hover:bg-gold-600 transition shadow-lg text-center uppercase tracking-widest text-sm flex items-center justify-center gap-2 group-hover:scale-105 transform duration-300"
                  >
                    {t('rooms.bookNow')}
                  </Link>

                </div>
              </div>
            ))}
          </div>

          {!isLoading && !loadError && filteredRooms.length === 0 && (
            <div className="text-center py-20">
              <p className="text-brown-500 text-xl font-serif">{t('rooms.noResults')}</p>
              <button 
                type="button"
                onClick={() => {setTypeFilter('ALL'); setRankFilter('ALL')}}
                className="mt-4 text-gold-600 font-bold hover:underline"
              >
                {t('rooms.clearFilters')}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>

      {previewRoom && activePreviewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#120d0a]/85 px-4 py-6 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-6xl rounded-[32px] border border-white/10 bg-[#1e1611] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.38)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white transition hover:bg-white/10"
              aria-label={t('rooms.closePreview')}
            >
              <X size={18} />
            </button>

            <div className="mb-5 flex flex-col gap-2 pr-14 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-400">
                  {t('rooms.preview')}
                </p>
                <h3 className="mt-2 text-2xl font-serif font-bold text-white sm:text-3xl">
                  {previewRoom.name}
                </h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80">
                {t('rooms.galleryCounter', {
                  current: previewImageIndex + 1,
                  total: previewImages.length,
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] bg-[#120d0a]">
              <img
                src={activePreviewImage}
                alt={t('rooms.photoAlt', { roomName: previewRoom.name })}
                className="h-[52vh] min-h-[280px] w-full object-cover sm:h-[60vh]"
              />

              {previewImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousPreviewImage}
                    className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-black/45"
                    aria-label={t('rooms.previousPreview')}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextPreviewImage}
                    className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-black/45"
                    aria-label={t('rooms.nextPreview')}
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {previewImages.length > 1 && (
              <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
                {previewImages.map((image, index) => (
                  <button
                    key={`${previewRoom.id}-${image}-${index}`}
                    type="button"
                    onClick={() => setPreviewImageIndex(index)}
                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border transition ${
                      index === previewImageIndex
                        ? 'border-gold-400 shadow-[0_0_0_1px_rgba(214,168,81,0.35)]'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={t('rooms.previewThumbnailAria', {
                      roomName: previewRoom.name,
                      index: index + 1,
                    })}
                  >
                    <img
                      src={image}
                      alt={t('rooms.photoAlt', { roomName: previewRoom.name })}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Rooms;
