// Định nghĩa các Interface dữ liệu khớp với Mock API Server (db.json)

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  className: string;
  major: string;
  email: string;
  phone: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  lecturer: string;
  description: string;
  semester: string;
}

export interface Session {
  id: string;
  courseId: string;
  dayOfWeek: number; // 2 (Thứ 2) đến 8 (Chủ nhật)
  startTime: string;
  endTime: string;
  room: string;
  note: string;
  course?: Course; // Được nhúng khi gọi ?_expand=course
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'todo' | 'done';
  updatedAt: string;
  course?: Course; // Được nhúng khi gọi ?_expand=course
}

export interface CreateAssignmentDTO {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'todo' | 'done';
}

export interface Grade {
  id: string;
  courseId: string;
  semester: string;
  attendance: number;
  midterm: number;
  final: number;
  total: number;
  letter: string;
  course?: Course; // Được nhúng khi gọi ?_expand=course
}
