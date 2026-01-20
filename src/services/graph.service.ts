import axios, { AxiosInstance } from 'axios';

const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';

export class GraphService {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: GRAPH_API_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get current user's profile information
   */
  async getProfile() {
    const response = await this.client.get('/me');
    return response.data;
  }

  /**
   * Get user's profile photo
   */
  async getProfilePhoto(): Promise<string | null> {
    try {
      const response = await this.client.get('/me/photo/$value', {
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.warn('Could not load profile photo:', error);
      return null;
    }
  }

  /**
   * Get user's recent emails
   */
  async getEmails(top: number = 10) {
    const response = await this.client.get(`/me/messages`, {
      params: {
        $top: top,
        $orderby: 'receivedDateTime desc',
        $select: 'subject,from,receivedDateTime,isRead,bodyPreview',
      },
    });
    return response.data.value;
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(startDate: Date, endDate: Date) {
    const response = await this.client.get('/me/calendarview', {
      params: {
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        $select: 'subject,start,end,location,attendees',
        $orderby: 'start/dateTime',
      },
    });
    return response.data.value;
  }

  /**
   * Get people the user works with
   */
  async getPeople(top: number = 10) {
    const response = await this.client.get('/me/people', {
      params: {
        $top: top,
      },
    });
    return response.data.value;
  }

  /**
   * Get user's OneDrive files
   */
  async getFiles(top: number = 20) {
    const response = await this.client.get('/me/drive/root/children', {
      params: {
        $top: top,
        $select: 'name,size,createdDateTime,lastModifiedDateTime,webUrl',
      },
    });
    return response.data.value;
  }

  /**
   * Search for content across Microsoft 365
   */
  async search(query: string) {
    const response = await this.client.post('/search/query', {
      requests: [
        {
          entityTypes: ['driveItem', 'message', 'event'],
          query: {
            queryString: query,
          },
          from: 0,
          size: 25,
        },
      ],
    });
    return response.data;
  }
}
