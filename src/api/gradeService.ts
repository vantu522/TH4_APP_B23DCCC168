import client from './client';
import { Grade } from './types';

/**
 * Service quản lý kết quả học tập / điểm số
 * Phục vụ màn hình: Kết quả học tập
 */
export const gradeService = {
  /**
   * Lấy danh sách điểm số của các môn học kèm thông tin môn
   * Endpoint: GET /grades?_expand=course
   * Sử dụng tại: Màn hình Kết quả học tập
   */
  getGrades: async (): Promise<Grade[]> => {
    const response = await client.get<Grade[]>('/grades', {
      params: {
        _expand: 'course',
      },
    });
    return response.data;
  },

  /**
   * Lấy điểm số theo học kỳ
   * Endpoint: GET /grades?semester=...&_expand=course
   */
  getGradesBySemester: async (semester: string): Promise<Grade[]> => {
    const response = await client.get<Grade[]>('/grades', {
      params: {
        semester,
        _expand: 'course',
      },
    });
    return response.data;
  },

  /**
   * Lấy chi tiết điểm của một môn theo ID bản ghi điểm
   * Endpoint: GET /grades/:id?_expand=course
   */
  getGradeById: async (id: string): Promise<Grade> => {
    const response = await client.get<Grade>(`/grades/${id}`, {
      params: {
        _expand: 'course',
      },
    });
    return response.data;
  },
};

export default gradeService;
