import apiClient from './apiClient';
import { RoomAvailabilityPayload } from '../types';

const roomsApiUrl = '/api/public/rooms/availability';

export const hasRoomsApiUrl = Boolean(roomsApiUrl);

export const getRooms = async (date: string): Promise<RoomAvailabilityPayload> => {
  if (!hasRoomsApiUrl) {
    throw new Error('Missing VITE_ROOMS_API_URL.');
  }

  const response = await apiClient.get<RoomAvailabilityPayload>(`${roomsApiUrl}?date=${date}`);
  return response.data;
};
