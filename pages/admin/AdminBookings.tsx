import React, { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { CalendarDays, Download, Pencil, RefreshCw, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteBookingRoom, editBookingRoom, getBookingRoomsByDate } from '../../services/bookingService';

type DatePickerValue = Date | null | [Date | null, Date | null];

interface BookingRoomSummary {
  id?: string;
  name?: string;
  thumbnail?: string;
  images?: string[];
  type?: string;
  category?: string;
  price?: number;
}

interface BookingRecord {
  id: string;
  name: string;
  phone: string;
  start_booking: string;
  end_booking: string;
  room_id: string;
  adult: number;
  child: number;
  note: string;
  createdAt?: string;
  updatedAt?: string;
  room?: BookingRoomSummary | null;
}

interface BookingFormState {
  name: string;
  phone: string;
  start_booking: string;
  end_booking: string;
  adult: string;
  child: string;
  note: string;
}

const bookingImageFallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">' +
      '<rect width="640" height="420" fill="#f6efe5"/>' +
      '<rect x="40" y="40" width="560" height="340" rx="28" fill="#eadbc4"/>' +
      '<text x="320" y="190" text-anchor="middle" fill="#8b7258" font-family="Arial, sans-serif" font-size="34" font-weight="700">HIEN PHUONG</text>' +
      '<text x="320" y="240" text-anchor="middle" fill="#9a7d58" font-family="Arial, sans-serif" font-size="22">BOOKING</text>' +
    '</svg>',
  );

const defaultFilterDate = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const parseDateOnly = (value: string | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const normalizedValue = value.length <= 10 ? `${value}T00:00:00` : value;
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const getStringValue = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const getNumberValue = (record: Record<string, unknown>, keys: string[]): number => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return 0;
};

const getStringArrayValue = (record: Record<string, unknown>, key: string): string[] => {
  const value = record[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

const extractBookingItems = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data;
  }

  if (record.data && typeof record.data === 'object') {
    const nested = record.data as Record<string, unknown>;

    if (Array.isArray(nested.rooms)) {
      return nested.rooms;
    }

    if (Array.isArray(nested.bookings)) {
      return nested.bookings;
    }

    if (Array.isArray(nested.items)) {
      return nested.items;
    }
  }

  if (Array.isArray(record.bookings)) {
    return record.bookings;
  }

  if (Array.isArray(record.items)) {
    return record.items;
  }

  return [];
};

const createBookingFormState = (booking: BookingRecord): BookingFormState => ({
  name: booking.name,
  phone: booking.phone,
  start_booking: booking.start_booking,
  end_booking: booking.end_booking,
  adult: `${booking.adult}`,
  child: `${booking.child}`,
  note: booking.note,
});

const isDateRangeValid = (startBooking: string, endBooking: string): boolean => {
  const startDate = parseDateOnly(startBooking);
  const endDate = parseDateOnly(endBooking);

  if (!startDate || !endDate) {
    return false;
  }

  return endDate.getTime() > startDate.getTime();
};

const normalizeBookingItem = (item: unknown, index: number): BookingRecord | null => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const activeBooking =
    record.active_booking && typeof record.active_booking === 'object'
      ? (record.active_booking as Record<string, unknown>)
      : null;

  if (activeBooking) {
    const roomId = getStringValue(record, ['id', '_id']);
    const startBooking = getStringValue(activeBooking, [
      'start_booking',
      'startBooking',
      'check_in',
      'checkIn',
    ]);
    const endBooking = getStringValue(activeBooking, [
      'end_booking',
      'endBooking',
      'check_out',
      'checkOut',
    ]);
    const room: BookingRoomSummary = {
      id: roomId || undefined,
      name: getStringValue(record, ['name']) || undefined,
      thumbnail: getStringValue(record, ['thumbnail']) || undefined,
      images: getStringArrayValue(record, 'images'),
      type: getStringValue(record, ['type']) || undefined,
      category: getStringValue(record, ['category']) || undefined,
      price: getNumberValue(record, ['price']) || undefined,
    };

    return {
      id:
        getStringValue(activeBooking, ['id', '_id']) ||
        `${roomId || 'booking'}-${startBooking || 'start'}-${index}`,
      name: getStringValue(activeBooking, [
        'name',
        'guest_name',
        'guestName',
        'customer_name',
        'customerName',
      ]),
      phone: getStringValue(activeBooking, [
        'phone',
        'guest_phone',
        'guestPhone',
        'customer_phone',
        'customerPhone',
      ]),
      start_booking: startBooking,
      end_booking: endBooking,
      room_id: roomId,
      adult: getNumberValue(activeBooking, ['adult', 'adults']),
      child: getNumberValue(activeBooking, ['child', 'children']),
      note: getStringValue(activeBooking, ['note', 'notes']),
      createdAt:
        getStringValue(activeBooking, ['createdAt', 'created_at']) ||
        getStringValue(record, ['createdAt', 'created_at']) ||
        undefined,
      updatedAt:
        getStringValue(activeBooking, ['updatedAt', 'updated_at']) ||
        getStringValue(record, ['updatedAt', 'updated_at']) ||
        undefined,
      room,
    };
  }

  const room =
    record.room && typeof record.room === 'object' ? (record.room as BookingRoomSummary) : null;

  const roomId = getStringValue(record, ['room_id', 'roomId']) || room?.id || '';
  const startBooking = getStringValue(record, ['start_booking', 'startBooking', 'check_in', 'checkIn']);
  const endBooking = getStringValue(record, ['end_booking', 'endBooking', 'check_out', 'checkOut']);

  return {
    id:
      getStringValue(record, ['id', '_id']) ||
      `${roomId || 'booking'}-${startBooking || 'start'}-${index}`,
    name: getStringValue(record, ['name', 'guest_name', 'guestName', 'customer_name', 'customerName']),
    phone: getStringValue(record, ['phone', 'guest_phone', 'guestPhone', 'customer_phone', 'customerPhone']),
    start_booking: startBooking,
    end_booking: endBooking,
    room_id: roomId,
    adult: getNumberValue(record, ['adult', 'adults']),
    child: getNumberValue(record, ['child', 'children']),
    note: getStringValue(record, ['note', 'notes']),
    createdAt: getStringValue(record, ['createdAt', 'created_at']) || undefined,
    updatedAt: getStringValue(record, ['updatedAt', 'updated_at']) || undefined,
    room,
  };
};

const normalizeBookingList = (payload: unknown): BookingRecord[] =>
  extractBookingItems(payload)
    .map((item, index) => normalizeBookingItem(item, index))
    .filter((item): item is BookingRecord => Boolean(item));

const normalizeRoomType = (type: string | undefined): 'Single' | 'Double' => {
  const normalizedType = type?.trim().toLowerCase();
  return normalizedType === 'double' ? 'Double' : 'Single';
};

const normalizeRoomCategory = (category: string | undefined): 'Standard' | 'VIP' => {
  const normalizedCategory = category?.trim().toLowerCase();
  return normalizedCategory === 'vip' ? 'VIP' : 'Standard';
};

const AdminBookings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [bookingsPayload, setBookingsPayload] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultFilterDate);
  const [search, setSearch] = useState('');
  const [bookingToEdit, setBookingToEdit] = useState<BookingRecord | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<BookingRecord | null>(null);
  const [formState, setFormState] = useState<BookingFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatApiDate = (value: Date | null): string | null => {
    if (!value || Number.isNaN(value.getTime())) {
      return null;
    }

    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    let isCancelled = false;

    const loadBookings = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextResponse = await getBookingRoomsByDate(formatApiDate(selectedDate) || '');

        if (!isCancelled) {
          setBookingsPayload(nextResponse);
        }
      } catch (error) {
        if (!isCancelled) {
          setBookingsPayload(null);
          setLoadError(error instanceof Error ? error.message : t('admin.bookings.loadError'));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBookings();

    return () => {
      isCancelled = true;
    };
  }, [reloadKey, t, selectedDate]);

  const bookings = normalizeBookingList(bookingsPayload);
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  const filteredBookings = bookings.filter((booking) => {
    const normalizedKeyword = search.trim().toLowerCase();
    const selectedDay = selectedDate ? new Date(selectedDate) : null;

    if (selectedDay) {
      selectedDay.setHours(0, 0, 0, 0);
    }

    const startDate = parseDateOnly(booking.start_booking);
    const endDate = parseDateOnly(booking.end_booking);

    const matchesDate =
      !selectedDay ||
      !startDate ||
      (!endDate
        ? selectedDay.getTime() === startDate.getTime()
        : selectedDay.getTime() >= startDate.getTime() && selectedDay.getTime() < endDate.getTime());

    const roomName = booking.room?.name ?? '';
    const roomId = booking.room?.id ?? booking.room_id;
    const note = booking.note ?? '';
    const matchesSearch =
      !normalizedKeyword ||
      booking.name.toLowerCase().includes(normalizedKeyword) ||
      booking.phone.toLowerCase().includes(normalizedKeyword) ||
      roomName.toLowerCase().includes(normalizedKeyword) ||
      roomId.toLowerCase().includes(normalizedKeyword) ||
      note.toLowerCase().includes(normalizedKeyword);

    return matchesDate && matchesSearch;
  });

  const totalBookings = filteredBookings.length;
  const bookedRooms = new Set(
    filteredBookings.map((booking) => booking.room?.id || booking.room_id).filter(Boolean)
  ).size;
  const totalAdults = filteredBookings.reduce((total, booking) => total + booking.adult, 0);
  const totalChildren = filteredBookings.reduce((total, booking) => total + booking.child, 0);

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

  const formatShortDate = (value?: string) => {
    if (!value) {
      return '-';
    }

    const date = parseDateOnly(value);

    if (!date) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatVnd = (price: number | undefined) => {
    if (typeof price !== 'number') {
      return null;
    }

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDateChange = (value: DatePickerValue) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    setSelectedDate(nextValue);
  };

  const updateFormField = (field: keyof BookingFormState, value: string) => {
    setFormState((current) => (current ? { ...current, [field]: value } : current));
  };

  const openEditModal = (booking: BookingRecord) => {
    setBookingToDelete(null);
    setActionError(null);
    setFormError(null);
    setBookingToEdit(booking);
    setFormState(createBookingFormState(booking));
  };

  const closeEditModal = () => {
    if (isSaving) {
      return;
    }

    setBookingToEdit(null);
    setFormState(null);
    setFormError(null);
    setActionError(null);
  };

  const openDeleteDialog = (booking: BookingRecord) => {
    setBookingToEdit(null);
    setFormState(null);
    setFormError(null);
    setActionError(null);
    setBookingToDelete(booking);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setBookingToDelete(null);
    setActionError(null);
  };

  const handleSubmitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bookingToEdit || !formState) {
      return;
    }

    const trimmedName = formState.name.trim();
    const trimmedPhone = formState.phone.trim();
    const roomId = bookingToEdit.room?.id || bookingToEdit.room_id;
    const adult = Number(formState.adult);
    const child = Number(formState.child);

    if (
      !trimmedName ||
      !trimmedPhone ||
      !formState.start_booking ||
      !formState.end_booking ||
      formState.adult.trim() === '' ||
      formState.child.trim() === ''
    ) {
      setFormError(t('admin.bookings.formErrorRequired'));
      return;
    }

    if (!roomId) {
      setFormError(t('admin.bookings.formErrorRoom'));
      return;
    }

    if (!isDateRangeValid(formState.start_booking, formState.end_booking)) {
      setFormError(t('admin.bookings.formErrorDateRange'));
      return;
    }

    if (!Number.isFinite(adult) || adult < 1 || !Number.isFinite(child) || child < 0) {
      setFormError(t('admin.bookings.formErrorGuests'));
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setActionError(null);

    try {
      await editBookingRoom({
        bookingId: bookingToEdit.id,
        payload: {
          name: trimmedName,
          phone: trimmedPhone,
          start_booking: formState.start_booking,
          end_booking: formState.end_booking,
          room_id: roomId,
          adult,
          child,
          note: formState.note.trim(),
        },
      });

      setBookingToEdit(null);
      setFormState(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('admin.bookings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);

    try {
      await deleteBookingRoom(bookingToDelete.id);
      setBookingToDelete(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('admin.bookings.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getBookingImage = (booking: BookingRecord) =>
    booking.room?.thumbnail || booking.room?.images?.[0] || bookingImageFallback;

  const getRoomName = (booking: BookingRecord) =>
    booking.room?.name || booking.room_id || t('admin.bookings.labels.unknownRoom');

  const getRoomTypeLabel = (booking: BookingRecord) =>
    booking.room?.type
      ? normalizeRoomType(booking.room.type) === 'Double'
        ? t('rooms.typeBadge.double')
        : t('rooms.typeBadge.single')
      : null;

  const getRoomCategoryLabel = (booking: BookingRecord) =>
    booking.room?.category
      ? normalizeRoomCategory(booking.room.category) === 'VIP'
        ? t('rooms.categoryBadge.vip')
        : t('rooms.filters.standard')
      : null;

  const getGuestLabel = (booking: BookingRecord) =>
    `${booking.adult} ${t('admin.bookings.labels.adults')} • ${booking.child} ${t('admin.bookings.labels.children')}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#e1d4c0] bg-white/80 p-6 shadow-[0_25px_80px_rgba(47,36,28,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4c2a9] bg-[#fff6e8] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7d58]">
              <Sparkles size={14} />
              {t('admin.bookings.eyebrow')}
            </div>
            <h2 className="mt-5 text-3xl font-serif font-bold text-[#2f241c] sm:text-4xl">
              {t('admin.bookings.title')}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f5a46] sm:text-base">
              {t('admin.bookings.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('admin.bookings.stats.total'), value: totalBookings, accent: 'text-[#2f241c]' },
          { label: t('admin.bookings.stats.rooms'), value: bookedRooms, accent: 'text-[#8b5e34]' },
          { label: t('admin.bookings.stats.adults'), value: totalAdults, accent: 'text-[#7a4d25]' },
          { label: t('admin.bookings.stats.children'), value: totalChildren, accent: 'text-[#b8872f]' },
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
                {t('admin.bookings.datePicker.title')}
              </p>
              <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
                {formatDisplayDate(selectedDate)}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-[#6f5a46]">
                {t('admin.bookings.datePicker.helper')}
              </p>
            </div>

            <div className="w-full xl:max-w-xs">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                {t('admin.bookings.datePicker.inputLabel')}
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
                placeholder={t('admin.bookings.searchPlaceholder')}
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
                {t('admin.bookings.retry')}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b79252]" />
              <p className="mt-4 text-sm font-semibold">{t('admin.bookings.loading')}</p>
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
                {t('admin.bookings.retry')}
              </button>
            </div>
          )}

          {!isLoading && !loadError && filteredBookings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
              <p className="text-sm font-semibold">{t('admin.bookings.empty')}</p>
            </div>
          )}

          {!isLoading && !loadError && filteredBookings.length > 0 && (
            <>
              <div className="hidden overflow-hidden rounded-[24px] border border-[#eadfce] xl:block">
                <div className="grid grid-cols-[1.1fr_1fr_1.1fr_0.8fr_1fr_0.8fr_0.85fr] bg-[#f6efe5] px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#8b7258]">
                  <span>{t('admin.bookings.table.customer')}</span>
                  <span>{t('admin.bookings.table.stay')}</span>
                  <span>{t('admin.bookings.table.room')}</span>
                  <span>{t('admin.bookings.table.guests')}</span>
                  <span>{t('admin.bookings.table.notes')}</span>
                  <span>{t('admin.bookings.table.updated')}</span>
                  <span>{t('admin.bookings.table.actions')}</span>
                </div>

                <div className="divide-y divide-[#efe4d5] bg-white">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="grid grid-cols-[1.1fr_1fr_1.1fr_0.8fr_1fr_0.8fr_0.85fr] items-center px-5 py-5 text-sm text-[#3b2d23]"
                    >
                      <div>
                        <p className="font-bold">{booking.name || '-'}</p>
                        <p className="mt-1 text-sm text-[#6f5a46]">{booking.phone || '-'}</p>
                      </div>

                      <div className="space-y-1 text-[#6f5a46]">
                        <p>
                          <span className="font-semibold">{t('admin.bookings.labels.checkIn')}:</span>{' '}
                          {formatShortDate(booking.start_booking)}
                        </p>
                        <p>
                          <span className="font-semibold">{t('admin.bookings.labels.checkOut')}:</span>{' '}
                          {formatShortDate(booking.end_booking)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-bold">{getRoomName(booking)}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {getRoomTypeLabel(booking) && (
                              <span className="rounded-full border border-[#d7c8b5] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f5a46]">
                                {getRoomTypeLabel(booking)}
                              </span>
                            )}
                            {getRoomCategoryLabel(booking) && (
                              <span className="rounded-full border border-[#d7c8b5] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f5a46]">
                                {getRoomCategoryLabel(booking)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-[#6f5a46]">{getGuestLabel(booking)}</div>

                      <div className="pr-4 text-sm leading-6 text-[#6f5a46]">
                        {booking.note || t('admin.bookings.labels.noNote')}
                        {formatVnd(booking.room?.price) && (
                          <p className="mt-2 font-semibold text-[#2f241c]">{formatVnd(booking.room?.price)}</p>
                        )}
                      </div>

                      <div className="text-[#6f5a46]">
                        {formatDateTime(booking.updatedAt || booking.createdAt)}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(booking)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f241c] transition hover:border-[#c59f58]"
                        >
                          <Pencil size={14} />
                          {t('admin.bookings.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(booking)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 transition hover:border-red-300 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          {t('admin.bookings.delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:hidden">
                {filteredBookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="overflow-hidden rounded-[26px] border border-[#eadfce] bg-[#fffdf9]"
                  >
                    <img
                      src={getBookingImage(booking)}
                      alt={t('admin.bookings.imageAlt', { name: getRoomName(booking) })}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = bookingImageFallback;
                      }}
                      className="h-44 w-full object-cover"
                    />

                    <div className="space-y-4 p-5">
                      <div>
                        <p className="text-lg font-bold text-[#2f241c]">{booking.name || '-'}</p>
                        <p className="mt-1 text-sm text-[#6f5a46]">{booking.phone || '-'}</p>
                      </div>

                      <div className="rounded-2xl bg-[#f5ede2] px-4 py-3 text-sm text-[#6f5a46]">
                        <p>
                          <span className="font-semibold">{t('admin.bookings.table.room')}:</span>{' '}
                          {getRoomName(booking)}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold">{t('admin.bookings.table.guests')}:</span>{' '}
                          {getGuestLabel(booking)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {getRoomTypeLabel(booking) && (
                          <span className="inline-flex rounded-full border border-[#d7c8b5] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6f5a46]">
                            {getRoomTypeLabel(booking)}
                          </span>
                        )}
                        {getRoomCategoryLabel(booking) && (
                          <span className="inline-flex rounded-full border border-[#d7c8b5] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6f5a46]">
                            {getRoomCategoryLabel(booking)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-[#6f5a46]">
                        <p>
                          <span className="font-semibold">{t('admin.bookings.labels.checkIn')}:</span>{' '}
                          {formatShortDate(booking.start_booking)}
                        </p>
                        <p>
                          <span className="font-semibold">{t('admin.bookings.labels.checkOut')}:</span>{' '}
                          {formatShortDate(booking.end_booking)}
                        </p>
                      </div>

                      {formatVnd(booking.room?.price) && (
                        <p className="text-sm font-semibold text-[#2f241c]">{formatVnd(booking.room?.price)}</p>
                      )}

                      <p className="text-sm leading-6 text-[#6f5a46]">
                        {booking.note || t('admin.bookings.labels.noNote')}
                      </p>

                      <div className="rounded-2xl bg-[#f5ede2] px-4 py-3 text-sm text-[#6f5a46]">
                        <span className="font-semibold">{t('admin.bookings.table.updated')}:</span>{' '}
                        {formatDateTime(booking.updatedAt || booking.createdAt)}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(booking)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] bg-white px-4 py-2 text-sm font-semibold text-[#2f241c] transition hover:border-[#c59f58]"
                        >
                          <Pencil size={16} />
                          {t('admin.bookings.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(booking)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                          {t('admin.bookings.delete')}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {bookingToEdit && formState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d120b]/60 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[32px] bg-[#fff8ee] shadow-[0_40px_120px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#ecdcc8] px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                  {t('admin.bookings.formEyebrow')}
                </p>
                <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
                  {t('admin.bookings.editTitle')}
                </h3>
                <p className="mt-2 text-sm text-[#6f5a46]">{t('admin.bookings.formSubtitle')}</p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddcfbc] text-[#6f5a46] transition hover:border-[#c59f58] hover:text-[#2f241c]"
                aria-label={t('admin.bookings.close')}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitEdit}
              className="max-h-[calc(92vh-96px)] overflow-y-auto px-6 py-6 pb-10 sm:px-8"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.bookings.fields.name')}
                  </label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(event) => updateFormField('name', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.bookings.placeholders.name')}
                    required
                  />
                  <p className="mt-2 text-sm text-[#6f5a46]">
                    {t('admin.bookings.table.room')}: {getRoomName(bookingToEdit)}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.bookings.fields.phone')}
                  </label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(event) => updateFormField('phone', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.bookings.placeholders.phone')}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.bookings.fields.startBooking')}
                  </label>
                  <input
                    type="date"
                    value={formState.start_booking}
                    onChange={(event) => updateFormField('start_booking', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.bookings.fields.endBooking')}
                  </label>
                  <input
                    type="date"
                    value={formState.end_booking}
                    onChange={(event) => updateFormField('end_booking', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.bookings.fields.adult')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formState.adult}
                    onChange={(event) => updateFormField('adult', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.bookings.fields.child')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formState.child}
                    onChange={(event) => updateFormField('child', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.bookings.fields.note')}
                  </label>
                  <textarea
                    value={formState.note}
                    onChange={(event) => updateFormField('note', event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 py-3 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.bookings.placeholders.note')}
                  />
                </div>
              </div>

              {(formError || actionError) && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {formError || actionError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex items-center justify-center rounded-full border border-[#d7c8b5] bg-white px-5 py-3 text-sm font-semibold text-[#2f241c] transition hover:border-[#c59f58]"
                >
                  {t('admin.bookings.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-full bg-[#2f241c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f1712] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? t('admin.bookings.savingUpdate') : t('admin.bookings.saveUpdate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d120b]/60 p-4">
          <div className="w-full max-w-lg rounded-[30px] bg-[#fff8ee] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.32)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                  {t('admin.bookings.eyebrow')}
                </p>
                <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
                  {t('admin.bookings.deleteTitle')}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeDeleteDialog}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddcfbc] text-[#6f5a46] transition hover:border-[#c59f58] hover:text-[#2f241c]"
                aria-label={t('admin.bookings.close')}
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#6f5a46]">
              {t('admin.bookings.deleteDescription', {
                customer: bookingToDelete.name || '-',
                room: getRoomName(bookingToDelete),
              })}
            </p>

            {actionError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="inline-flex items-center justify-center rounded-full border border-[#d7c8b5] bg-white px-5 py-3 text-sm font-semibold text-[#2f241c] transition hover:border-[#c59f58]"
              >
                {t('admin.bookings.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteBooking}
                disabled={isDeleting}
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? t('admin.bookings.deleting') : t('admin.bookings.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
