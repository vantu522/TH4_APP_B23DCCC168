import { create } from 'zustand';
import { Student, mockStudents } from '../types/student';

interface StudentStore {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (updatedStudent: Student) => void;
  deleteStudent: (id: string) => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  students: mockStudents, // Khởi tạo với dữ liệu mock
  addStudent: (student: Student) =>
    set((state: { students: Student[] }) => ({ students: [...state.students, student] })),
  updateStudent: (updatedStudent: Student) =>
    set((state: { students: Student[] }) => ({
      students: state.students.map((student: Student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      ),
    })),
  deleteStudent: (id) =>
    set((state) => ({
      students: state.students.filter((student) => student.id !== id),
    })),
}));
