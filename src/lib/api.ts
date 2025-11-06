// Frontend API utility for connecting to MongoDB backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:4000/api';

export interface Event {
  id?: string;
  _id?: string;
  name: string;
  type: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  image?: string;
  theatres?: string[];
  showtimes?: string[];
  ticketPrice: string;
  venueType?: string;
  sportType?: string;
  familyId?: string;
  status?: string;
  capacity?: number;
  createdAt?: string;
  familyCategory?: string;
  familyDetails?: {
    type: "Marriage" | "Birthday";
    brideName?: string;
    groomName?: string;
    celebrantName?: string;
    celebrationYear?: string;
  };
}

export interface Booking {
  id?: string;
  _id?: string;
  eventId: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  venue: string;
  theatre?: string;
  tier?: string;
  pricePerSeat?: number;
  seats: string[];
  quantity: number;
  totalPrice: number;
  paymentMethod: string;
  bookingDate: string;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return this.request('/events');
  }

  async getEvent(id: string): Promise<Event> {
    return this.request(`/events/${id}`);
  }

  async createEvent(event: Omit<Event, 'id' | '_id'>): Promise<Event> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return this.request('/bookings');
  }

  async createBooking(booking: Omit<Booking, 'id' | '_id'>): Promise<Booking> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;