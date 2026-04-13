import React, { useEffect, useState } from 'react';
import {
  BedDouble,
  Download,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AdminRoomPayload,
  createAdminRoom,
  deleteAdminRoom,
  getAdminRooms,
  updateAdminRoom,
} from '../../services/adminRoomService';
import { Room, RoomCategory, RoomType } from '../../types';

type CategoryFilter = 'ALL' | RoomCategory;
type RoomModalMode = 'create' | 'edit' | null;

interface RoomFormState {
  name: string;
  price: string;
  description: string;
  type: RoomType;
  thumbnail: string;
  images: string[];
  category: RoomCategory;
}

const roomImageFallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">' +
      '<rect width="640" height="420" fill="#f6efe5"/>' +
      '<rect x="40" y="40" width="560" height="340" rx="28" fill="#eadbc4"/>' +
      '<text x="320" y="205" text-anchor="middle" fill="#8b7258" font-family="Arial, sans-serif" font-size="34" font-weight="700">HIEN PHUONG</text>' +
      '<text x="320" y="252" text-anchor="middle" fill="#9a7d58" font-family="Arial, sans-serif" font-size="20">ROOM IMAGE</text>' +
    '</svg>',
  );

const createInitialFormState = (): RoomFormState => ({
  name: '',
  price: '',
  description: '',
  type: 'Single',
  thumbnail: '',
  images: [''],
  category: 'Standard',
});

const mapRoomToFormState = (room: Room): RoomFormState => ({
  name: room.name,
  price: String(room.price),
  description: room.description,
  type: room.type,
  thumbnail: room.thumbnail ?? '',
  images: room.images?.length ? [...room.images] : [''],
  category: room.category,
});

const AdminRooms: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<RoomModalMode>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomPendingDelete, setRoomPendingDelete] = useState<Room | null>(null);
  const [formState, setFormState] = useState<RoomFormState>(createInitialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRooms = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextRooms = await getAdminRooms();
      setRooms(nextRooms);
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'MISSING_ADMIN_TOKEN'
          ? t('admin.auth.redirectHint')
          : t('admin.rooms.loadError');
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, []);

  useEffect(() => {
    if ((!modalMode && !roomPendingDelete) || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalMode, roomPendingDelete]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingRoom(null);
    setFormState(createInitialFormState());
    setFormError(null);
  };

  const openEditModal = (room: Room) => {
    setModalMode('edit');
    setEditingRoom(room);
    setFormState(mapRoomToFormState(room));
    setFormError(null);
  };

  const openDeleteDialog = (room: Room) => {
    setRoomPendingDelete(room);
    setDeleteError(null);
  };

  const closeModal = (force = false) => {
    if (isSaving && !force) {
      return;
    }

    setModalMode(null);
    setEditingRoom(null);
    setFormState(createInitialFormState());
    setFormError(null);
  };

  const closeDeleteDialog = (force = false) => {
    if (isDeleting && !force) {
      return;
    }

    setRoomPendingDelete(null);
    setDeleteError(null);
  };

  const updateFormField = <K extends keyof RoomFormState>(field: K, value: RoomFormState[K]) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateImageField = (index: number, value: string) => {
    setFormState((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => (imageIndex === index ? value : image)),
    }));
  };

  const addImageField = () => {
    setFormState((current) => ({
      ...current,
      images: [...current.images, ''],
    }));
  };

  const removeImageField = (index: number) => {
    setFormState((current) => {
      const nextImages = current.images.filter((_, imageIndex) => imageIndex !== index);

      return {
        ...current,
        images: nextImages.length > 0 ? nextImages : [''],
      };
    });
  };

  const buildPayload = (): AdminRoomPayload | null => {
    const normalizedName = formState.name.trim();
    const normalizedDescription = formState.description.trim();
    const normalizedThumbnail = formState.thumbnail.trim();
    const normalizedPrice = Number(formState.price);

    if (!normalizedName || !normalizedDescription || !normalizedThumbnail) {
      setFormError(t('admin.rooms.formErrorRequired'));
      return null;
    }

    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      setFormError(t('admin.rooms.formErrorPrice'));
      return null;
    }

    return {
      name: normalizedName,
      price: normalizedPrice,
      description: normalizedDescription,
      type: formState.type,
      thumbnail: normalizedThumbnail,
      images: formState.images.map((image) => image.trim()).filter(Boolean),
      category: formState.category,
    };
  };

  const handleSubmitRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const payload = buildPayload();

    if (!payload) {
      return;
    }

    setIsSaving(true);

    try {
      if (modalMode === 'edit' && editingRoom) {
        await updateAdminRoom(editingRoom.id, payload);
      } else {
        await createAdminRoom(payload);
      }

      closeModal(true);
      await loadRooms();
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'MISSING_ADMIN_TOKEN'
          ? t('admin.auth.redirectHint')
          : t('admin.rooms.saveError');
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomPendingDelete) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteAdminRoom(roomPendingDelete.id);
      closeDeleteDialog(true);
      await loadRooms();
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'MISSING_ADMIN_TOKEN'
          ? t('admin.auth.redirectHint')
          : t('admin.rooms.deleteError');
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const normalizedKeyword = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedKeyword ||
      room.name.toLowerCase().includes(normalizedKeyword) ||
      room.id.toLowerCase().includes(normalizedKeyword) ||
      room.description.toLowerCase().includes(normalizedKeyword);
    const matchesCategory = categoryFilter === 'ALL' || room.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalRooms = rooms.length;
  const singleRooms = rooms.filter((room) => room.type === 'Single').length;
  const doubleRooms = rooms.filter((room) => room.type === 'Double').length;
  const vipRooms = rooms.filter((room) => room.category === 'VIP').length;
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
  const isEditMode = modalMode === 'edit';

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

  const getRoomImage = (room: Room) => room.thumbnail || room.images?.[0] || roomImageFallback;
  const getRoomCategoryLabel = (category: RoomCategory) => {
    if (category === 'VIP') {
      return i18n.language === 'vi' ? 'Cao cấp' : 'Deluxe';
    } else {
      return i18n.language === 'vi' ? 'Tiêu chuẩn' : 'Standard';
    }
  };

  const getRoomTypeLabel = (type: RoomType) => {
    if (type === 'Single') {
      return i18n.language === 'vi' ? 'Phòng Đơn' : 'Double Room';
    } else {
      return i18n.language === 'vi' ? 'Phòng Đôi' : 'Quad Room';
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
                {t('admin.rooms.eyebrow')}
              </div>
              <h2 className="mt-5 text-3xl font-serif font-bold text-[#2f241c] sm:text-4xl">
                {t('admin.rooms.title')}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f5a46] sm:text-base">
                {t('admin.rooms.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712]"
              >
                <Plus size={16} />
                {t('admin.rooms.addRoom')}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t('admin.rooms.stats.total'), value: totalRooms, accent: 'text-[#2f241c]' },
            { label: t('admin.rooms.stats.single'), value: singleRooms, accent: 'text-[#8b5e34]' },
            { label: t('admin.rooms.stats.double'), value: doubleRooms, accent: 'text-[#7a4d25]' },
            { label: t('admin.rooms.stats.vip'), value: vipRooms, accent: 'text-[#b8872f]' },
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a7d58]"
                size={18}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('admin.rooms.searchPlaceholder')}
                className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-[#fffdf9] pl-11 pr-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL' as const, label: t('admin.rooms.filters.all') },
                { value: 'Standard' as const, label: t('admin.rooms.filters.standard') },
                { value: 'VIP' as const, label: t('admin.rooms.filters.vip') },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setCategoryFilter(filter.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    categoryFilter === filter.value
                      ? 'bg-[#2f241c] text-white'
                      : 'bg-[#f5ede2] text-[#6f5a46] hover:bg-[#eadbc4]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="mt-6 rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b79252]" />
              <p className="mt-4 text-sm font-semibold">{t('admin.rooms.loading')}</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="mt-6 rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 text-red-700">
              <p className="text-sm font-semibold">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadRooms()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1712]"
              >
                <RefreshCw size={16} />
                {t('admin.rooms.retry')}
              </button>
            </div>
          )}

          {!isLoading && !loadError && (
            <>
              <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-[#eadfce] xl:block">
                <div className="grid grid-cols-[1.2fr_0.7fr_0.85fr_1fr_1.25fr_0.9fr_1.1fr] bg-[#f6efe5] px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#8b7258]">
                  <span>{t('admin.rooms.table.room')}</span>
                  <span>{t('admin.rooms.table.type')}</span>
                  <span>{t('admin.rooms.table.category')}</span>
                  <span>{t('admin.rooms.table.pricing')}</span>
                  <span>{t('admin.rooms.table.description')}</span>
                  <span>{t('admin.rooms.table.updated')}</span>
                  <span>{t('admin.rooms.table.actions')}</span>
                </div>

                <div className="divide-y divide-[#efe4d5] bg-white">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="grid grid-cols-[1.2fr_0.7fr_0.85fr_1fr_1.25fr_0.9fr_1.1fr] items-center px-5 py-5 text-sm text-[#3b2d23]"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={getRoomImage(room)}
                          alt={t('admin.rooms.imageAlt', { name: room.name })}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = roomImageFallback;
                          }}
                          className="h-16 w-20 rounded-2xl border border-[#e7dbc8] object-cover"
                        />
                        <div>
                          <p className="font-bold">{room.name}</p>
                        </div>
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(room)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f241c] transition hover:border-[#c59f58]"
                        >
                          <Pencil size={14} />
                          {t('admin.rooms.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(room)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 transition hover:border-red-300 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          {t('admin.rooms.delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:hidden">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="overflow-hidden rounded-[26px] border border-[#eadfce] bg-[#fffdf9]"
                  >
                    <img
                      src={getRoomImage(room)}
                      alt={t('admin.rooms.imageAlt', { name: room.name })}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = roomImageFallback;
                      }}
                      className="h-44 w-full object-cover"
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-[#2f241c]">{room.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8b7258]">
                            {room.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#2f241c]">{formatVnd(room.price)}</p>
                          {(typeof room.usdPrice === 'number' || typeof room.euroPrice === 'number') && (
                            <p className="mt-1 text-xs text-[#7c6753]">
                              {[formatForeign(room.usdPrice, 'USD'), formatForeign(room.euroPrice, 'EUR')]
                                .filter(Boolean)
                                .join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#d7c8b5] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6f5a46]">
                          {room.type}
                        </span>
                        <span className="rounded-full border border-[#d7c8b5] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6f5a46]">
                          {getRoomCategoryLabel(room.category)}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl bg-[#f7efe4] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7258]">
                          {t('admin.rooms.table.description')}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#5e4b39]">{room.description}</p>
                        <p className="mt-3 text-xs text-[#7c6753]">
                          {t('admin.rooms.table.updated')}: {formatDateTime(room.updatedAt)}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(room)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] bg-white px-4 py-2 text-sm font-semibold text-[#2f241c] transition hover:border-[#c59f58]"
                        >
                          <Pencil size={16} />
                          {t('admin.rooms.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(room)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                          {t('admin.rooms.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRooms.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-[#d9c8b1] bg-[#fff9f0] px-6 py-10 text-center text-[#7a6149]">
                  <BedDouble className="mx-auto h-8 w-8 text-[#b79252]" />
                  <p className="mt-4 text-sm font-semibold">{t('admin.rooms.empty')}</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d120b]/60 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[32px] bg-[#fff8ee] shadow-[0_40px_120px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#ecdcc8] px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                  {t('admin.rooms.formEyebrow')}
                </p>
                <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
                  {isEditMode ? t('admin.rooms.editTitle') : t('admin.rooms.addTitle')}
                </h3>
                <p className="mt-2 text-sm text-[#6f5a46]">{t('admin.rooms.formSubtitle')}</p>
              </div>

              <button
                type="button"
                onClick={() => closeModal()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddcfbc] text-[#6f5a46] transition hover:border-[#c59f58] hover:text-[#2f241c]"
                aria-label={t('admin.rooms.close')}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitRoom}
              className="max-h-[calc(92vh-96px)] overflow-y-auto px-6 py-6 pb-10 sm:px-8"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.rooms.fields.name')}
                  </label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(event) => updateFormField('name', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.rooms.placeholders.name')}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.rooms.fields.price')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formState.price}
                    onChange={(event) => updateFormField('price', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.rooms.placeholders.price')}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.rooms.fields.thumbnail')}
                  </label>
                  <input
                    type="url"
                    value={formState.thumbnail}
                    onChange={(event) => updateFormField('thumbnail', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.rooms.placeholders.thumbnail')}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.rooms.fields.type')}
                  </label>
                  <select
                    value={formState.type}
                    onChange={(event) => updateFormField('type', event.target.value as RoomType)}
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                  >
                    <option value="Single">{t('admin.rooms.typeSingle')}</option>
                    <option value="Double">{t('admin.rooms.typeDouble')}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.rooms.fields.category')}
                  </label>
                  <select
                    value={formState.category}
                    onChange={(event) =>
                      updateFormField('category', event.target.value as RoomCategory)
                    }
                    className="h-12 w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                  >
                    <option value="Standard">{t('admin.rooms.categoryStandard')}</option>
                    <option value="VIP">{t('admin.rooms.categoryVip')}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                    {t('admin.rooms.fields.description')}
                  </label>
                  <textarea
                    value={formState.description}
                    onChange={(event) => updateFormField('description', event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 py-3 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                    placeholder={t('admin.rooms.placeholders.description')}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#7d6550]">
                      {t('admin.rooms.fields.images')}
                    </label>
                    <button
                      type="button"
                      onClick={addImageField}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f241c] transition hover:border-[#c59f58]"
                    >
                      <Plus size={14} />
                      {t('admin.rooms.addImage')}
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {formState.images.map((image, index) => (
                      <div key={`${index}-${modalMode}`} className="flex items-center gap-3">
                        <input
                          type="url"
                          value={image}
                          onChange={(event) => updateImageField(index, event.target.value)}
                          className="h-12 flex-1 rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                          placeholder={t('admin.rooms.placeholders.image')}
                        />
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e3d6c5] bg-white text-[#7d6550] transition hover:border-red-300 hover:text-red-600"
                          aria-label={t('admin.rooms.removeImage')}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
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
                  onClick={() => closeModal()}
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#d7c8b5] px-5 text-sm font-semibold text-[#2f241c] transition hover:border-[#c59f58] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('admin.rooms.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2f241c] px-5 text-sm font-semibold text-white transition hover:bg-[#1f1712] disabled:cursor-not-allowed disabled:bg-[#2f241c]/60"
                >
                  {isSaving
                    ? isEditMode
                      ? t('admin.rooms.savingUpdate')
                      : t('admin.rooms.savingCreate')
                    : isEditMode
                      ? t('admin.rooms.saveUpdate')
                      : t('admin.rooms.saveCreate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {roomPendingDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1d120b]/65 p-4">
          <div className="w-full max-w-lg rounded-[32px] bg-[#fff8ee] shadow-[0_40px_120px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#ecdcc8] px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                  {t('admin.rooms.formEyebrow')}
                </p>
                <h3 className="mt-2 text-2xl font-serif font-bold text-[#2f241c]">
                  {t('admin.rooms.deleteTitle')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5a46]">
                  {t('admin.rooms.deleteDescription', {
                    name: roomPendingDelete.name,
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => closeDeleteDialog()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddcfbc] text-[#6f5a46] transition hover:border-[#c59f58] hover:text-[#2f241c]"
                aria-label={t('admin.rooms.close')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="rounded-2xl bg-[#f7efe4] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7258]">
                  {t('admin.rooms.table.room')}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#2f241c]">{roomPendingDelete.name}</p>
                <p className="mt-1 text-sm text-[#6f5a46]">
                  {roomPendingDelete.id} • {roomPendingDelete.type} • {roomPendingDelete.category}
                </p>
              </div>

              {deleteError && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => closeDeleteDialog()}
                  disabled={isDeleting}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#d7c8b5] px-5 text-sm font-semibold text-[#2f241c] transition hover:border-[#c59f58] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('admin.rooms.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteRoom()}
                  disabled={isDeleting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  <Trash2 size={16} />
                  {isDeleting ? t('admin.rooms.deleting') : t('admin.rooms.deleteConfirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminRooms;
