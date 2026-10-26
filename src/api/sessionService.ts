import client from './client';
import { Session } from './types';

/**
 * Service quản lý thời khóa biểu / lịch học
 * Phục vụ màn hình: Thời khóa biểu, Chi tiết buổi học
 */
export const sessionService = {
  /**
   * Lấy danh sách toàn bộ các buổi học kèm thông tin môn học tương ứng
   * Endpoint: GET /sessions?_expand=course
   * Sử dụng tại: Màn hình Thời khóa biểu
   */
  getSessions: async (): Promise<Session[]> => {
    const response = await client.get<Session[]>('/sessions', {
      params: {
        _expand: 'course',
      },
    });
    return response.data;
  },

  /**
   * Lấy chi tiết một buổi học theo ID kèm thông tin môn học
   * Endpoint: GET /sessions/:id?_expand=course
   * Sử dụng tại: Màn hình Chi tiết buổi học
   */
  getSessionById: async (id: string): Promise<Session> => {
    const response = await client.get<Session>(`/sessions/${id}`, {
      params: {
        _expand: 'course',
      },
    });
    return response.data;
  },

  /**
   * Lấy lịch học theo ngày trong tuần (ví dụ: 'Thứ 2', 'Thứ 3', ...)
   * Endpoint: GET /sessions?dayOfWeek=...&_expand=course
   */
  getSessionsByDay: async (dayOfWeek: string): Promise<Session[]> => {
    const response = await client.get<Session[]>('/sessions', {
      params: {
        dayOfWeek,
        _expand: 'course',
      },
    });
    return response.data;
  },
};

export default sessionService;
