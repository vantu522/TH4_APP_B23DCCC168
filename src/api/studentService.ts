import client from './client';
import { Student } from './types';

/**
 * Service quản lý thông tin sinh viên
 * Các endpoint phục vụ màn hình: Trang chủ, Cá nhân, Chỉnh sửa thông tin cá nhân
 */
export const studentService = {
  /**
   * Lấy thông tin sinh viên theo id (Mặc định id = '1')
   * Endpoint: GET /students/:id
   * Sử dụng tại: Trang chủ, Cá nhân
   */
  getStudentById: async (id: string = '1'): Promise<Student> => {
    const response = await client.get<Student>(`/students/${id}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin sinh viên theo id (Mặc định id = '1')
   * Endpoint: PATCH /students/:id
   * Sử dụng tại: Chỉnh sửa thông tin cá nhân
   */
  updateStudent: async (
    id: string = '1',
    data: Partial<Omit<Student, 'id'>>
  ): Promise<Student> => {
    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const response = await client.patch<Student>(`/students/${id}`, updatePayload);
    return response.data;
  },
};

export default studentService;
