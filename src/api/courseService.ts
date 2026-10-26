import client from './client';
import { Course } from './types';

/**
 * Service quản lý môn học
 * Phục vụ màn hình: Môn học, Chi tiết môn học
 */
export const courseService = {
  /**
   * Lấy danh sách tất cả các môn học
   * Endpoint: GET /courses
   * Sử dụng tại: Màn hình Môn học
   */
  getCourses: async (): Promise<Course[]> => {
    const response = await client.get<Course[]>('/courses');
    return response.data;
  },

  /**
   * Lấy chi tiết môn học theo ID
   * Endpoint: GET /courses/:id
   * Sử dụng tại: Màn hình Chi tiết môn học
   */
  getCourseById: async (id: string): Promise<Course> => {
    const response = await client.get<Course>(`/courses/${id}`);
    return response.data;
  },
};

export default courseService;
