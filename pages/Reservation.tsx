import React, { useState, useEffect } from 'react';
import {
  ReservationForm as IReservationForm,
  Room,
  RoomAvailabilityPayload,
  RoomAvailabilityResponse,
} from '../types';
import { Check } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { getRooms } from '../services/roomService';
import { bookingRoom } from '@/services/bookingService';

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

const normalizeBookingStatus = (status: string | undefined): 'available' | 'booked' => {
  const normalizedStatus = status?.trim().toLowerCase();
  return normalizedStatus === 'booked' ? 'booked' : 'available';
};

const formatPrice = (price: number, language: string) =>
  new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);

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

const getNextDate = (dateValue: string): string => {
  const nextDate = new Date(dateValue);
  nextDate.setDate(nextDate.getDate() + 1);
  return nextDate.toISOString().split('T')[0];
};

const isValidStayDateRange = (checkIn: string, checkOut: string): boolean => {
  if (!checkIn || !checkOut) {
    return false;
  }

  return new Date(checkOut).getTime() > new Date(checkIn).getTime();
};

const Reservation: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState<IReservationForm>({
    fullName: '',
    phone: '',
    roomId: '',
    adults: 1,
    children: 0,
    checkIn: '',
    checkOut: '',
    notes: '',
  });

  const [nights, setNights] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [roomsPayload, setRoomsPayload] = useState<RoomAvailabilityPayload | null>(null);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [roomsLoadError, setRoomsLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reservationRooms = [...extractRoomsFromPayload(roomsPayload)].sort((firstRoom, secondRoom) => {
    const firstRoomPriority = normalizeBookingStatus(firstRoom.booking_status) === 'available' ? 0 : 1;
    const secondRoomPriority = normalizeBookingStatus(secondRoom.booking_status) === 'available' ? 0 : 1;

    if (firstRoomPriority !== secondRoomPriority) {
      return firstRoomPriority - secondRoomPriority;
    }

    return firstRoom.name.localeCompare(secondRoom.name);
  });

  const selectedRoom = reservationRooms.find((room) => room.id === form.roomId) ?? null;
  const availableRoomCount = reservationRooms.filter(
    (room) => normalizeBookingStatus(room.booking_status) === 'available'
  ).length;

  useEffect(() => {
    if (isValidStayDateRange(form.checkIn, form.checkOut)) {
      const d1 = new Date(form.checkIn);
      const d2 = new Date(form.checkOut);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays > 0 ? diffDays : 0);
      return;
    }

    setNights(0);
  }, [form.checkIn, form.checkOut]);

  useEffect(() => {
    if (!form.checkIn) {
      setRoomsPayload(null);
      setRoomsLoadError(null);
      setIsRoomsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadRooms = async () => {
      setIsRoomsLoading(true);
      setRoomsLoadError(null);
      setRoomsPayload(null);

      try {
        const nextResponse = await getRooms(form.checkIn);

        if (!isCancelled) {
          setRoomsPayload(nextResponse);
        }
      } catch (error) {
        console.error('Failed to load reservation rooms:', error);
        if (!isCancelled) {
          setRoomsPayload(null);
          setRoomsLoadError(error instanceof Error ? error.message : t('reservation.roomLoadError'));
        }
      } finally {
        if (!isCancelled) {
          setIsRoomsLoading(false);
        }
      }
    };

    void loadRooms();

    return () => {
      isCancelled = true;
    };
  }, [form.checkIn]);

  useEffect(() => {
    if (!form.roomId) {
      return;
    }

    const selectedRoomStillAvailable = reservationRooms.some(
      (room) =>
        room.id === form.roomId && normalizeBookingStatus(room.booking_status) === 'available'
    );

    if (!selectedRoomStillAvailable) {
      setForm((current) => ({ ...current, roomId: '' }));
    }
  }, [form.roomId, reservationRooms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextValue = (name === 'adults' || name === 'children') ? parseInt(value) || 0 : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'checkIn'
        ? {
            roomId: '',
            checkOut:
              current.checkOut && current.checkOut <= nextValue ? '' : current.checkOut,
          }
        : {}),
    }));

    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidStayDateRange(form.checkIn, form.checkOut)) {
      setSubmitError(t('reservation.submitErrorInvalidDateRange'));
      return;
    }

    if (!selectedRoom) {
      setSubmitError(t('reservation.submitErrorNoRoom'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await bookingRoom({
        name: form.fullName,
        phone: form.phone,
        start_booking: form.checkIn,
        end_booking: form.checkOut,
        room_id: form.roomId,
        adult: form.adults,
        child: form.children,
        note: form.notes,
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to create booking:', error);
      setSubmitError(error instanceof Error ? error.message : t('reservation.submitErrorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = 'block text-xs font-bold text-[#5a5a5a] uppercase tracking-[1px] mb-3';
  const inputStyle =
    'w-full h-12 px-5 border border-[#E5DED6] rounded-xl focus:outline-none focus:border-[#BFA15A] focus:ring-4 focus:ring-[#BFA15A]/10 bg-white text-[#3E2C23] placeholder-[#3E2C23]/30 transition-all duration-300';

  const getRoomTypeLabel = (type: string) =>
    type?.trim().toLowerCase() === 'double' ? t('rooms.typeBadge.double') : t('rooms.typeBadge.single');

  const getRoomCategoryLabel = (category: string) =>
    category?.trim().toLowerCase() === 'vip' ? t('rooms.filters.vip') : t('rooms.filters.standard');

  const getRoomStatusLabel = (status: string | undefined) =>
    normalizeBookingStatus(status) === 'booked'
      ? t('reservation.roomStatus.booked')
      : t('reservation.roomStatus.available');

  const handleRoomSelect = (roomId: string) => {
    setForm((current) => ({
      ...current,
      roomId,
    }));

    if (submitError) {
      setSubmitError(null);
    }
  };

  const getInternationalRatesLabel = (room: Room) => {
    const usdPrice = formatForeignPrice(room.usdPrice, 'USD');
    const euroPrice = formatForeignPrice(room.euroPrice, 'EUR');

    if (!usdPrice && !euroPrice) {
      return null;
    }

    return t('reservation.roomInternationalRates', {
      usdPrice: usdPrice ?? '--',
      euroPrice: euroPrice ?? '--',
    });
  };

  const getRoomOptionLabel = (room: Room) => {
    return `${room.name} • ${formatPrice(room.price, i18n.language)} • ${getRoomStatusLabel(room.booking_status)}`;
  };

  const customStyles = `
    input[type="date"]::-webkit-calendar-picker-indicator {
      background-color: #BFA15A;
      color: white;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 20px;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-left: 8px;
      padding: 0;
    }
    
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      background-color: #A38645;
      box-shadow: 0 4px 12px rgba(62, 44, 35, 0.15);
      transform: translateY(-1px);
    }

    input[type="date"]::-webkit-calendar-picker-indicator:focus {
      outline: 2px solid #BFA15A;
      outline-offset: 2px;
    }
  `;

  if (submitted) {
    return (
      <div>
        <div className="relative h-[40vh] flex items-center justify-center bg-[#3E2C23]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url("https://picsum.photos/1920/1080?random=13")' }}
          ></div>
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 text-center animate-fade-in-up px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
              {t('reservation.successHeroTitle')}
            </h1>
          </div>
        </div>

        <div className="min-h-[50vh] bg-[#F6F2EC] flex items-center justify-center p-8">
          <div className="bg-white p-10 rounded-[18px] shadow-2xl text-center max-w-lg w-full border border-[#E5DED6]">
            <div className="w-20 h-20 bg-[#F6F2EC] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#3E2C23]" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#3E2C23] mb-4">
              {t('reservation.successTitle')}
            </h2>
            <p className="text-[#5a5a5a] mb-8">
              <Trans
                i18nKey="reservation.successMessage"
                values={{ fullName: form.fullName, phone: form.phone }}
                components={{ strong: <span className="font-bold text-[#3E2C23]" /> }}
              />
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-[#BFA15A] font-bold hover:underline tracking-wide uppercase text-sm"
            >
              {t('reservation.successAction')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{customStyles}</style>

      <div className="relative h-[50vh] flex items-center justify-center bg-[#3E2C23]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://picsum.photos/1920/1080?random=13")' }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center animate-fade-in-up px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">
            {t('reservation.heroTitle')}
          </h1>
          <div className="w-24 h-1 bg-[#BFA15A] mx-auto"></div>
          <p className="text-[#BFA15A] mt-4 text-lg tracking-wider uppercase font-bold drop-shadow-sm">
            {t('reservation.heroSubtitle')}
          </p>
        </div>
      </div>

      <div className="py-24 bg-[#F6F2EC] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#Fdfbf9] rounded-[18px] shadow-[0_25px_50px_-12px_rgba(62,44,35,0.15)] overflow-hidden -mt-32 relative z-20 border border-[#E5DED6]">
            <div className="bg-[#3E2C23] py-10 px-8 text-center">
              <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
                {t('reservation.formTitle')}
              </h2>
              <p className="text-[#BFA15A] mt-3 uppercase tracking-widest text-xs font-bold">
                {t('reservation.priceNotice')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 md:p-14">
              <div className="space-y-8 mb-12">
                <div>
                  <label className={labelStyle}>
                    {t('reservation.fullName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder={t('reservation.fullNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    {t('reservation.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder={t('reservation.phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="w-full h-px bg-[#E5DED6] mb-12"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 mb-12">
                <div>
                  <label className={labelStyle}>
                    {t('reservation.checkIn')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    required
                    value={form.checkIn}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>
                    {t('reservation.checkOut')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    required
                    value={form.checkOut}
                    onChange={handleChange}
                    min={form.checkIn ? getNextDate(form.checkIn) : undefined}
                    className={inputStyle}
                  />
                  {form.checkIn && form.checkOut && !isValidStayDateRange(form.checkIn, form.checkOut) && (
                    <p className="mt-3 text-sm text-red-600">{t('reservation.dateRangeError')}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={labelStyle}>
                    {t('reservation.room')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative hidden md:block">
                    <select
                      name="roomId"
                      value={form.roomId}
                      onChange={handleChange}
                      disabled={!form.checkIn || isRoomsLoading}
                      className={`${inputStyle} appearance-none cursor-pointer disabled:cursor-not-allowed disabled:bg-[#F6F2EC] disabled:text-[#3E2C23]/40`}
                    >
                      <option value="">
                        {!form.checkIn
                          ? t('reservation.roomPlaceholderChooseDate')
                          : isRoomsLoading
                            ? t('reservation.roomPlaceholderLoading')
                            : t('reservation.roomPlaceholderSelect')}
                      </option>
                      {reservationRooms.map((room) => {
                        const isAvailable = normalizeBookingStatus(room.booking_status) === 'available';

                        return (
                          <option key={room.id} value={room.id} disabled={!isAvailable}>
                            {getRoomOptionLabel(room)}
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#3E2C23]">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  {form.checkIn && !isRoomsLoading && !roomsLoadError && reservationRooms.length > 0 && (
                    <div className="mt-4 md:hidden">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c6c60]">
                        {t('reservation.roomMobilePicker')}
                      </p>
                      <div className="max-h-96 overflow-y-auto pr-1">
                        <div className="grid grid-cols-2 gap-3">
                        {reservationRooms.map((room) => {
                          const isAvailable = normalizeBookingStatus(room.booking_status) === 'available';
                          const isSelected = form.roomId === room.id;
                          const internationalRatesLabel = getInternationalRatesLabel(room);

                          return (
                            <button
                              key={room.id}
                              type="button"
                              onClick={() => isAvailable && handleRoomSelect(room.id)}
                              disabled={!isAvailable}
                              className={`w-full rounded-xl border p-3 text-left transition ${
                                isSelected
                                  ? 'border-[#BFA15A] bg-[#BFA15A]/10 shadow-md'
                                  : isAvailable
                                    ? 'border-[#E5DED6] bg-white'
                                    : 'border-[#E5DED6] bg-[#F6F2EC] opacity-70'
                              } ${isAvailable ? 'active:scale-[0.99]' : 'cursor-not-allowed'}`}
                            >
                              <div className="space-y-2">
                                <p className="text-sm font-bold leading-snug text-[#3E2C23]">
                                  {room.name}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                                      isAvailable
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-red-50 text-red-700'
                                    }`}
                                  >
                                    {getRoomStatusLabel(room.booking_status)}
                                  </span>
                                  <span className="rounded-full border border-[#BFA15A]/30 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#BFA15A]">
                                    {getRoomTypeLabel(room.type)}
                                  </span>
                                  <span className="rounded-full border border-[#3E2C23]/10 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3E2C23]">
                                    {getRoomCategoryLabel(room.category)}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 space-y-2">
                                <p className="text-sm font-semibold text-[#3E2C23]">
                                  {formatPrice(room.price, i18n.language)}
                                </p>
                                {internationalRatesLabel && (
                                  <p className="text-[11px] leading-4 text-[#7c6c60]">
                                    {internationalRatesLabel}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-sm">
                    {!form.checkIn && (
                      <p className="text-[#7c6c60]">{t('reservation.roomHelpChooseDate')}</p>
                    )}
                    {form.checkIn && isRoomsLoading && (
                      <p className="text-[#7c6c60]">{t('reservation.roomLoading')}</p>
                    )}
                    {form.checkIn && roomsLoadError && (
                      <p className="text-red-600">{t('reservation.roomLoadError')}</p>
                    )}
                    {form.checkIn && !isRoomsLoading && !roomsLoadError && reservationRooms.length === 0 && (
                      <p className="text-[#7c6c60]">{t('reservation.roomNoResults')}</p>
                    )}
                    {form.checkIn &&
                      !isRoomsLoading &&
                      !roomsLoadError &&
                      reservationRooms.length > 0 &&
                      availableRoomCount === 0 && (
                        <p className="text-[#7c6c60]">{t('reservation.roomNoAvailable')}</p>
                      )}
                    {form.checkIn && !isRoomsLoading && !roomsLoadError && availableRoomCount > 0 && (
                      <p className="text-[#7c6c60]">{t('reservation.roomHelp')}</p>
                    )}
                  </div>

                  {selectedRoom && (
                    <div className="mt-4 rounded-xl border border-[#E5DED6] bg-[#F6F2EC] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#3E2C23]">{selectedRoom.name}</span>
                        <span className="rounded-full border border-[#BFA15A]/30 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#BFA15A]">
                          {getRoomTypeLabel(selectedRoom.type)}
                        </span>
                        <span className="rounded-full border border-[#3E2C23]/10 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3E2C23]">
                          {getRoomCategoryLabel(selectedRoom.category)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[#5a5a5a]">
                        {t('reservation.roomSummary', {
                          type: getRoomTypeLabel(selectedRoom.type),
                          category: getRoomCategoryLabel(selectedRoom.category),
                          price: formatPrice(selectedRoom.price, i18n.language),
                        })}
                      </p>
                      {getInternationalRatesLabel(selectedRoom) && (
                        <p className="mt-2 text-sm font-medium text-[#7c6c60]">
                          {getInternationalRatesLabel(selectedRoom)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>{t('reservation.adults')}</label>
                  <input
                    type="number"
                    name="adults"
                    min="1"
                    required
                    value={form.adults}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>{t('reservation.children')}</label>
                  <input
                    type="number"
                    name="children"
                    min="0"
                    value={form.children}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
              </div>

              {nights > 0 && (
                <div className="bg-[#BFA15A]/10 p-5 rounded-xl border border-[#BFA15A]/30 text-center mb-12">
                  <span className="text-[#3E2C23] font-bold text-sm tracking-wide">
                    {t('reservation.stayLengthLabel')}{' '}
                  </span>
                  <span className="text-[#BFA15A] font-bold text-xl ml-2">
                    {t('reservation.nights', { count: nights })}
                  </span>
                </div>
              )}

              <div className="mb-12">
                <label className={labelStyle}>{t('reservation.notes')}</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full p-5 border border-[#E5DED6] rounded-xl focus:outline-none focus:border-[#BFA15A] focus:ring-4 focus:ring-[#BFA15A]/10 bg-white text-[#3E2C23] resize-none transition-all duration-300 placeholder-[#3E2C23]/30"
                  placeholder={t('reservation.notesPlaceholder')}
                />
              </div>

              {submitError && (
                <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedRoom || !isValidStayDateRange(form.checkIn, form.checkOut)}
                className="w-full h-[54px] bg-[#3E2C23] hover:bg-[#2A1D17] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#3E2C23]/60 disabled:hover:translate-y-0 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 tracking-[0.1em] uppercase text-sm"
              >
                {isSubmitting ? t('reservation.submitLoading') : t('reservation.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
