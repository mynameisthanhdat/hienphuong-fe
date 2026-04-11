import axios from 'axios';

export interface CurrencyRate {
  id: string;
  usd: number;
  euro: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrencyPayload {
  usd: number;
  euro: number;
}

interface CurrencyApiResponse {
  success?: boolean;
  data?: CurrencyRate;
}

const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || undefined,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

const currencyApiUrlPublic = '/api/public/currency';
const currencyApiUrl = '/api/currency';

const normalizeCurrencyRate = (payload: CurrencyApiResponse | CurrencyRate): CurrencyRate => {
  if ('data' in payload && payload.data) {
    return payload.data;
  }

  return payload as CurrencyRate;
};

export const getCurrencyRate = async (): Promise<CurrencyRate> => {
  const response = await publicApiClient.get<CurrencyApiResponse | CurrencyRate>(currencyApiUrlPublic);
  return normalizeCurrencyRate(response.data);
};

export const updateCurrencyRate = async (
  payload: CurrencyPayload,
): Promise<CurrencyRate> => {
  try {
    const primaryUrl = currencyApiUrl;
    const response = await publicApiClient.put<CurrencyApiResponse | CurrencyRate>(primaryUrl, payload);

    return normalizeCurrencyRate(response.data);
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.status === 405)
    ) {
      const fallbackResponse = await publicApiClient.put<CurrencyApiResponse | CurrencyRate>(
        currencyApiUrl,
        payload,
      );

      return normalizeCurrencyRate(fallbackResponse.data);
    }

    throw error;
  }
};
