import apiClient from './apiClient';
import { getAdminSession } from './adminAuth';
import { ApiResponse, Room, RoomCategory, RoomType } from '../types';

type AdminRoomsPayload = Room[] | ApiResponse<Room[]> | { data: Room[] };

const adminRoomsApiUrl = '/api/rooms';

export interface AdminRoomPayload {
  name: string;
  price: number;
  description: string;
  type: RoomType;
  thumbnail: string;
  images: string[];
  category: RoomCategory;
}

const getAdminRequestConfig = () => {
  const session = getAdminSession();

  if (!session?.token) {
    throw new Error('MISSING_ADMIN_TOKEN');
  }

  return {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  };
};

const extractRooms = (payload: AdminRoomsPayload): Room[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if ('data' in payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

export const getAdminRooms = async (): Promise<Room[]> => {
  const response = await apiClient.get<AdminRoomsPayload>(adminRoomsApiUrl, getAdminRequestConfig());

  return extractRooms(response.data);
};

export const createAdminRoom = async (payload: AdminRoomPayload): Promise<void> => {
  await apiClient.post(adminRoomsApiUrl, payload, getAdminRequestConfig());
};

export const updateAdminRoom = async (roomId: string, payload: AdminRoomPayload): Promise<void> => {
  await apiClient.put(`${adminRoomsApiUrl}/${roomId}`, payload, getAdminRequestConfig());
};

export const deleteAdminRoom = async (roomId: string): Promise<void> => {
  await apiClient.delete(`${adminRoomsApiUrl}/${roomId}`, getAdminRequestConfig());
};
