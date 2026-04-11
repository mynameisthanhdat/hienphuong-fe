import apiClient from "./apiClient";

const bookingApiUrl = "/api/bookings";

export interface BookingRoomPayload {
  name?: string;
  phone: string;
  start_booking: string;
  end_booking: string;
  room_id: string;
  adult: number;
  child: number;
  note: string;
}

export const bookingRoom = async (
  payload: BookingRoomPayload,
): Promise<any> => {
  const response = await apiClient.post<any>(bookingApiUrl, payload);
  return response.data;
};

export const getBookingRooms = async (): Promise<any> => {
  const response = await apiClient.get<any>(bookingApiUrl);
  return response.data;
}

export const getBookingRoomsByDate = async (date: string): Promise<any> => {
  const response = await apiClient.get<any>(`${bookingApiUrl}/booked-rooms?date=${date}`);
  return response.data;
}

export const editBookingRoom = async ({
  payload,
  bookingId,
}: {
  payload: BookingRoomPayload;
  bookingId: string;
}): Promise<any> => {
  const response = await apiClient.put<any>(
    `${bookingApiUrl}/${bookingId}`,
    payload,
  );
  return response.data;
};

export const deleteBookingRoom = async (bookingId: string): Promise<any> => {
  const response = await apiClient.delete<any>(`${bookingApiUrl}/${bookingId}`);
  return response.data;
};
