export type RoomType = 'Single' | 'Double';
export type RoomCategory = 'Standard' | 'VIP';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  category: RoomCategory;
  price: number;
  usdPrice?: number;
  euroPrice?: number;
  description: string;
  booking_status?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  thumbnail?: string;
}

export interface RoomAvailabilitySummary {
  total_rooms: number;
  available_rooms: number;
  booked_rooms: number;
}

export interface RoomAvailabilityResponse {
  date: string;
  summary: RoomAvailabilitySummary;
  rooms: Room[];
  available_rooms: Room[];
  booked_rooms: Room[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type RoomAvailabilityPayload =
  | Room[]
  | RoomAvailabilityResponse
  | ApiResponse<RoomAvailabilityResponse>
  | ApiResponse<Room[]>;

export interface ReservationForm {
  fullName: string;
  phone: string;
  roomId: string;
  adults: number;
  children: number;
  checkIn: string;
  checkOut: string;
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TouristSpot {
  id: number;
  name: string;
  description: string;
  image: string;
}

export enum ImageSize {
  Size_1K = '1K',
  Size_2K = '2K',
  Size_4K = '4K'
}
