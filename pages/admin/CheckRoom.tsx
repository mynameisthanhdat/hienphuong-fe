import React, { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { CalendarDays, Download, RefreshCw, Search, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Room, RoomAvailabilityPayload, RoomAvailabilityResponse } from '../../types';
import { getRooms, hasRoomsApiUrl } from '../../services/roomService';

type DatePickerValue = Date | null | [Date | null, Date | null];
type StatusFilter = 'ALL' | 'available' | 'booked';
type TypeFilter = 'ALL' | 'Single' | 'Double';
type CategoryFilter = 'ALL' | 'Standard' | 'VIP';

const roomImageFallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">' +
      '<rect width="640" height="420" fill="#f6efe5"/>' +
      '<rect x="40" y="40" width="560" height="340" rx="28" fill="#eadbc4"/>' +
      '<text x="320" y="205" text-anchor="middle" fill="#8b7258" font-family="Arial, sans-serif" font-size="34" font-weight="700">HIEN PHUONG</text>' +
      '<text x="320" y="252" text-anchor="middle" fill="#9a7d58" font-family="Arial, sans-serif" font-size="20">ROOM STATUS</text>' +
    '</svg>',
  );

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

const CheckRoom: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [roomsPayload, setRoomsPayload] = useState<RoomAvailabilityPayload | null>(null);
  const [isLoading, setIsLoading] = useState(hasRoomsApiUrl);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultAvailabilityDate);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');

  const selectedApiDate = formatApiDate(selectedDate);

  useEffect(() => {
    if (!hasRoomsApiUrl || !selectedApiDate) {
      setIsLoading(false);
      setLoadError(null);
      setRoomsPayload(null);
      return;
    }

    let isCancelled = false;

    const loadAvailability = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextResponse = await getRooms(selectedApiDate);

        if (!isCancelled) {
          setRoomsPayload(nextResponse);
        }
      } catch (error) {
        if (!isCancelled) {
          setRoomsPayload(null);
          setLoadError(error instanceof Error ? error.message : t('admin.checkRoom.loadError'));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadAvailability();

    return () => {
      isCancelled = true;
    };
  }, [reloadKey, selectedApiDate, t]);

  const availabilityResponse = extractRoomAvailabilityResponse(roomsPayload);
  const rooms = extractRoomsFromPayload(roomsPayload);
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  const filteredRooms = rooms.filter((room) => {
    const normalizedKeyword = search.trim().toLowerCase();
    const roomStatus = normalizeBookingStatus(room.booking_status);
    const roomType = normalizeRoomType(room.type);
    const roomCategory = normalizeRoomCategory(room.category);

    const matchesSearch =
      !normalizedKeyword ||
      room.name.toLowerCase().includes(normalizedKeyword) ||
      room.id.toLowerCase().includes(normalizedKeyword) ||
      room.description.toLowerCase().includes(normalizedKeyword);
    const matchesStatus = statusFilter === 'ALL' || roomStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || roomType === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' || roomCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

  const totalRooms = availabilityResponse?.summary?.total_rooms ?? rooms.length;
  const availableRooms =
    availabilityResponse?.summary?.available_rooms ??
    rooms.filter((room) => normalizeBookingStatus(room.booking_status) === 'available').length;
  const bookedRooms =
    availabilityResponse?.summary?.booked_rooms ??
    rooms.filter((room) => normalizeBookingStatus(room.booking_status) === 'booked').length;
  const vipRooms = rooms.filter((room) => normalizeRoomCategory(room.category) === 'VIP').length;

  const formatDisplayDate = (value: Date | null) => {
    if (!value || Number.isNaN(value.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(value);
  };

  const formatVnd = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);

  const formatForeign = (price: number | undefined, currency: 'USD' | 'EUR') => {
    if (typeof price !== 'number') {
      return null;
    }

    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
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

  const handleDateChange = (value: DatePickerValue) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    setSelectedDate(nextValue);
  };

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

  const getRoomImage = (room: Room) => room.thumbnail || room.images?.[0] || roomImageFallback;

  const getRoomTypeLabel = (type: string | undefined) =>
    normalizeRoomType(type) === 'Double' ? t('rooms.typeBadge.double') : t('rooms.typeBadge.single');

  const getRoomCategoryLabel = (category: string | undefined) =>
    normalizeRoomCategory(category) === 'VIP'
      ? t('rooms.categoryBadge.vip')
      : t('rooms.filters.standard');

  const FilterGroup = ({
    title,
    options,
    current,
    onChange,
  }: {
    title: string;
    options: { label: string; value: string }[];
    current: string;
    onChange: (value: string) => void;
  }) => (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">{title}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              current === option.value
                ? 'bg-[#2f241c] text-white shadow-lg'
                : 'bg-[#f5ede2] text-[#6f5a46] hover:bg-[#eadbc4]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#e1d4c0] bg-white/80 p-6 shadow-[0_25px_80px_rgba(47,36,28,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4c2a9] bg-[#fff6e8] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7d58]">
              <Sparkles size={14} />
              {t('admin.checkRoom.eyebrow')}
            </div>
            <h2 className="mt-5 text-3xl font-serif font-bold text-[#2f241c] sm:text-4xl">
              {t('admin.checkRoom.title')}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f5a46] sm:text-base">
              {t('admin.checkRoom.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('admin.checkRoom.stats.total'), value: totalRooms, accent: 'text-[#2f241c]' },
          {
            label: t('admin.checkRoom.stats.available'),
            value: availableRooms,
            accent: 'text-emerald-700',
          },
          {
            label: t('admin.checkRoom.stats.booked'),
            value: bookedRooms,
            accent: 'text-red-700',
          },
          { label: t('admin.checkRoom.stats.vip'), value: vipRooms, accent: 'text-[#b8872f]' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[28px] border border-[#e1d4c0] bg-white/85 p-5 shadow-[0_20px_60px_rgba(47,36,28,0.06)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">{stat.label}</p>
            <p className={`mt-4 text-4xl font-serif font-bold ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[32px] border border-[#e1d4c0] bg-white/85 p-5 shadow-[0_20px_60px_rgba(47,36,28,0.06)] sm:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7d58]">
                {t('rooms.datePicker.title')}
              </p>
              <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
                {formatDisplayDate(selectedDate)}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-[#6f5a46]">{t('rooms.datePicker.helper')}</p>
            </div>

            <div className="w-full xl:max-w-xs">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                {t('rooms.datePicker.inputLabel')}
              </label>
              <div className="rounded-2xl border border-[#e3d6c5] bg-[#fffdf9] px-4 py-3 shadow-sm">
                <DatePicker
                  onChange={handleDateChange}
                  value={selectedDate}
                  clearIcon={null}
                  calendarIcon={<CalendarDays size={18} className="text-[#b79252]" />}
                  className="w-full text-[#2f241c]"
                  format="dd/MM/y"
                  locale={locale}
                />
              </div>
            </div>
          </div>

          {availabilityResponse?.summary && (
            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-[#e3d6c5] bg-[#f5ede2] px-4 py-2 text-sm font-semibold text-[#6f5a46]">
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

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a7d58]"
                size={18}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('admin.checkRoom.searchPlaceholder')}
                className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-[#fffdf9] pl-11 pr-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
              />
            </div>

            <div className="flex justify-start lg:justify-end">
              <button
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
                className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] bg-white px-4 py-2 text-sm font-semibold text-[#2f241c] transition hover:border-[#c59f58]"
              >
                <RefreshCw size={16} />
                {t('admin.checkRoom.retry')}
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <FilterGroup
              title={t('admin.checkRoom.filters.status')}
              current={statusFilter}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              options={[
                { label: t('admin.checkRoom.filters.all'), value: 'ALL' },
                { label: t('rooms.status.available'), value: 'available' },
                { label: t('rooms.status.booked'), value: 'booked' },
              ]}
            />
            <FilterGroup
              title={t('admin.checkRoom.filters.type')}
              current={typeFilter}
              onChange={(value) => setTypeFilter(value as TypeFilter)}
              options={[
                { label: t('admin.checkRoom.filters.all'), value: 'ALL' },
                { label: t('rooms.filters.single'), value: 'Single' },
                { label: t('rooms.filters.double'), value: 'Double' },
              ]}
            />
            <FilterGroup
              title={t('admin.checkRoom.filters.category')}
              current={categoryFilter}
              onChange={(value) => setCategoryFilter(value as CategoryFilter)}
              options={[
                { label: t('admin.checkRoom.filters.all'), value: 'ALL' },
                { label: t('rooms.filters.standard'), value: 'Standard' },
                { label: t('rooms.filters.vip'), value: 'VIP' },
              ]}
            />
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b79252]" />
              <p className="mt-4 text-sm font-semibold">{t('admin.checkRoom.loading')}</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 text-red-700">
              <p className="text-sm font-semibold">{loadError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712]"
              >
                <RefreshCw size={16} />
                {t('admin.checkRoom.retry')}
              </button>
            </div>
          )}

          {!isLoading && !loadError && filteredRooms.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
              <p className="text-sm font-semibold">{t('admin.checkRoom.empty')}</p>
            </div>
          )}

          {!isLoading && !loadError && filteredRooms.length > 0 && (
            <>
              <div className="hidden overflow-hidden rounded-[24px] border border-[#eadfce] xl:block">
                <div className="grid grid-cols-[1.3fr_0.85fr_0.8fr_0.85fr_1fr_1.25fr_0.85fr] bg-[#f6efe5] px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#8b7258]">
                  <span>{t('admin.checkRoom.table.room')}</span>
                  <span>{t('admin.checkRoom.table.status')}</span>
                  <span>{t('admin.checkRoom.table.type')}</span>
                  <span>{t('admin.checkRoom.table.category')}</span>
                  <span>{t('admin.checkRoom.table.pricing')}</span>
                  <span>{t('admin.checkRoom.table.description')}</span>
                  <span>{t('admin.checkRoom.table.updated')}</span>
                </div>

                <div className="divide-y divide-[#efe4d5] bg-white">
                  {filteredRooms.map((room) => {
                    const statusMeta = getRoomStatusMeta(room.booking_status);

                    return (
                      <div
                        key={room.id}
                        className="grid grid-cols-[1.3fr_0.85fr_0.8fr_0.85fr_1fr_1.25fr_0.85fr] items-center px-5 py-5 text-sm text-[#3b2d23]"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={getRoomImage(room)}
                            alt={t('admin.checkRoom.imageAlt', { name: room.name })}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = roomImageFallback;
                            }}
                            className="h-16 w-20 rounded-2xl border border-[#e7dbc8] object-cover"
                          />
                          <div>
                            <p className="font-bold">{room.name}</p>
                            {/* <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8b7258]">
                              {room.id}
                            </p> */}
                          </div>
                        </div>
                        <div>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="font-semibold text-[#6f5a46]">{getRoomTypeLabel(room.type)}</div>
                        <div className="font-semibold text-[#6f5a46]">{getRoomCategoryLabel(room.category)}</div>
                        <div>
                          <p className="font-semibold">{formatVnd(room.price)}</p>
                          {(typeof room.usdPrice === 'number' || typeof room.euroPrice === 'number') && (
                            <p className="mt-1 text-xs text-[#7c6753]">
                              {[formatForeign(room.usdPrice, 'USD'), formatForeign(room.euroPrice, 'EUR')]
                                .filter(Boolean)
                                .join(' • ')}
                            </p>
                          )}
                        </div>
                        <div className="pr-4 text-sm leading-6 text-[#6f5a46]">{room.description}</div>
                        <div className="text-[#6f5a46]">{formatDateTime(room.updatedAt)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 xl:hidden">
                {filteredRooms.map((room) => {
                  const statusMeta = getRoomStatusMeta(room.booking_status);

                  return (
                    <article
                      key={room.id}
                      className="overflow-hidden rounded-[26px] border border-[#eadfce] bg-[#fffdf9]"
                    >
                      <img
                        src={getRoomImage(room)}
                        alt={t('admin.checkRoom.imageAlt', { name: room.name })}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = roomImageFallback;
                        }}
                        className="h-44 w-full object-cover"
                      />

                      <div className="space-y-4 p-5">
                        <div>
                          <p className="text-lg font-bold text-[#2f241c]">{room.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8b7258]">{room.id}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                          <span className="inline-flex rounded-full border border-[#d7c8b5] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6f5a46]">
                            {getRoomTypeLabel(room.type)}
                          </span>
                          <span className="inline-flex rounded-full border border-[#d7c8b5] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6f5a46]">
                            {getRoomCategoryLabel(room.category)}
                          </span>
                        </div>

                        <div>
                          <p className="text-lg font-bold text-[#2f241c]">{formatVnd(room.price)}</p>
                          {(typeof room.usdPrice === 'number' || typeof room.euroPrice === 'number') && (
                            <p className="mt-1 text-sm text-[#7c6753]">
                              {[formatForeign(room.usdPrice, 'USD'), formatForeign(room.euroPrice, 'EUR')]
                                .filter(Boolean)
                                .join(' • ')}
                            </p>
                          )}
                        </div>

                        <p className="text-sm leading-6 text-[#6f5a46]">{room.description}</p>

                        <div className="rounded-2xl bg-[#f5ede2] px-4 py-3 text-sm text-[#6f5a46]">
                          <span className="font-semibold">{t('admin.checkRoom.table.updated')}:</span>{' '}
                          {formatDateTime(room.updatedAt)}
                        </div>
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
  );
};

export default CheckRoom;
