import client from './client';
import { Assignment, CreateAssignmentDTO } from './types';

/**
 * Service quản lý bài tập
 * Phục vụ màn hình: Bài tập, Trang chủ, Cập nhật trạng thái bài tập, Thêm bài tập mới
 */
export const assignmentService = {
  /**
   * Lấy danh sách bài tập kèm thông tin môn học, sắp xếp theo hạn nộp
   * Endpoint: GET /assignments?_expand=course&_sort=dueDate
   * Sử dụng tại: Màn hình Bài tập, Trang chủ
   */
  getAssignments: async (order: 'asc' | 'desc' = 'asc'): Promise<Assignment[]> => {
    const response = await client.get<Assignment[]>('/assignments', {
      params: {
        _expand: 'course',
        _sort: 'dueDate',
        _order: order,
      },
    });
    return response.data;
  },

  /**
   * Lấy chi tiết một bài tập theo ID kèm thông tin môn học
   * Endpoint: GET /assignments/:id?_expand=course
   */
  getAssignmentById: async (id: string): Promise<Assignment> => {
    const response = await client.get<Assignment>(`/assignments/${id}`, {
      params: {
        _expand: 'course',
      },
    });
    return response.data;
  },

  /**
   * Cập nhật trạng thái bài tập ('todo' hoặc 'done')
   * Endpoint: PATCH /assignments/:id
   * Sử dụng tại: Cập nhật trạng thái bài tập
   */
  updateAssignmentStatus: async (
    id: string,
    status: 'todo' | 'done'
  ): Promise<Assignment> => {
    const response = await client.patch<Assignment>(`/assignments/${id}`, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  /**
   * Cập nhật thông tin chi tiết bài tập
   * Endpoint: PATCH /assignments/:id
   */
  updateAssignment: async (
    id: string,
    data: Partial<Omit<Assignment, 'id' | 'course'>>
  ): Promise<Assignment> => {
    const response = await client.patch<Assignment>(`/assignments/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  /**
   * Thêm một bài tập mới (Chức năng mới)
   * Endpoint: POST /assignments
   * Sử dụng tại: Thêm bài tập mới
   */
  createAssignment: async (data: CreateAssignmentDTO): Promise<Assignment> => {
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const response = await client.post<Assignment>('/assignments', payload);
    return response.data;
  },
};

export default assignmentService;
