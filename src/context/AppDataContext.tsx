import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Student,
  Course,
  Session,
  Assignment,
  CreateAssignmentDTO,
  Grade,
} from '../api/types';
import {
  studentService,
  courseService,
  sessionService,
  assignmentService,
  gradeService,
} from '../api';
import { getCache, setCache } from '../storage/cache';
import { STORAGE_KEYS } from '../storage/keys';
import outbox from '../storage/outbox';
import { useSync } from './SyncContext';

interface AppDataContextType {
  student: Student | null;
  courses: Course[];
  sessions: Session[];
  assignments: Assignment[];
  grades: Grade[];
  isLoading: boolean;

  fetchStudent: (id?: string) => Promise<Student | null>;
  updateStudent: (data: Partial<Student>) => Promise<boolean>;

  fetchCourses: () => Promise<Course[]>;
  getCourseById: (id: string) => Promise<Course | undefined>;

  fetchSessions: () => Promise<Session[]>;
  getSessionById: (id: string) => Promise<Session | undefined>;

  fetchAssignments: () => Promise<Assignment[]>;
  getAssignmentById: (id: string) => Promise<Assignment | undefined>;
  updateAssignmentStatus: (id: string, status: 'todo' | 'done') => Promise<boolean>;
  createAssignment: (data: CreateAssignmentDTO) => Promise<boolean>;

  fetchGrades: () => Promise<Grade[]>;
  getGradeById: (id: string) => Promise<Grade | undefined>;
}

const AppDataContext = createContext<AppDataContextType>({} as AppDataContextType);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { setOnlineStatus, refreshPendingCount } = useSync();

  // Khởi tạo đọc từ Cache
  useEffect(() => {
    const initFromCache = async () => {
      const [cStudent, cCourses, cSessions, cAssignments, cGrades] =
        await Promise.all([
          getCache<Student>(STORAGE_KEYS.STUDENT),
          getCache<Course[]>(STORAGE_KEYS.COURSES),
          getCache<Session[]>(STORAGE_KEYS.SESSIONS),
          getCache<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS),
          getCache<Grade[]>(STORAGE_KEYS.GRADES),
        ]);

      if (cStudent) setStudent(cStudent);
      if (cCourses) setCourses(cCourses);
      if (cSessions) setSessions(cSessions);
      if (cAssignments) setAssignments(cAssignments);
      if (cGrades) setGrades(cGrades);
    };

    initFromCache();
  }, []);

  // --- Sinh viên ---
  const fetchStudent = useCallback(
    async (id = '1'): Promise<Student | null> => {
      try {
        const data = await studentService.getStudentById(id);
        setStudent(data);
        await setCache(STORAGE_KEYS.STUDENT, data);
        setOnlineStatus(true);
        return data;
      } catch (err) {
        setOnlineStatus(false);
        const cached = await getCache<Student>(STORAGE_KEYS.STUDENT);
        if (cached) setStudent(cached);
        return cached;
      }
    },
    [setOnlineStatus]
  );

  const updateStudent = useCallback(
    async (data: Partial<Student>): Promise<boolean> => {
      const updated = {
        ...(student || {
          id: '1',
          studentCode: 'SV001',
          fullName: '',
          className: '',
          major: '',
          email: '',
          phone: '',
          updatedAt: '',
        }),
        ...data,
        updatedAt: new Date().toISOString(),
      } as Student;

      setStudent(updated);
      await setCache(STORAGE_KEYS.STUDENT, updated);

      try {
        await studentService.updateStudent(updated.id, data);
        setOnlineStatus(true);
        return true;
      } catch (err) {
        setOnlineStatus(false);
        // Đưa vào Outbox
        await outbox.enqueue({
          method: 'PATCH',
          url: `/students/${updated.id}`,
          body: { ...data, updatedAt: new Date().toISOString() },
        });
        await refreshPendingCount();
        return false;
      }
    },
    [student, setOnlineStatus, refreshPendingCount]
  );

  // --- Môn học ---
  const fetchCourses = useCallback(async (): Promise<Course[]> => {
    try {
      const data = await courseService.getCourses();
      setCourses(data);
      await setCache(STORAGE_KEYS.COURSES, data);
      setOnlineStatus(true);
      return data;
    } catch {
      setOnlineStatus(false);
      const cached = await getCache<Course[]>(STORAGE_KEYS.COURSES);
      if (cached) setCourses(cached);
      return cached || [];
    }
  }, [setOnlineStatus]);

  const getCourseById = useCallback(
    async (id: string): Promise<Course | undefined> => {
      try {
        const course = await courseService.getCourseById(id);
        return course;
      } catch {
        return courses.find((c) => c.id === id);
      }
    },
    [courses]
  );

  // --- Lịch học ---
  const fetchSessions = useCallback(async (): Promise<Session[]> => {
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
      await setCache(STORAGE_KEYS.SESSIONS, data);
      setOnlineStatus(true);
      return data;
    } catch {
      setOnlineStatus(false);
      const cached = await getCache<Session[]>(STORAGE_KEYS.SESSIONS);
      if (cached) setSessions(cached);
      return cached || [];
    }
  }, [setOnlineStatus]);

  const getSessionById = useCallback(
    async (id: string): Promise<Session | undefined> => {
      try {
        const session = await sessionService.getSessionById(id);
        return session;
      } catch {
        return sessions.find((s) => s.id === id);
      }
    },
    [sessions]
  );

  // --- Bài tập ---
  const fetchAssignments = useCallback(async (): Promise<Assignment[]> => {
    try {
      const data = await assignmentService.getAssignments();
      setAssignments(data);
      await setCache(STORAGE_KEYS.ASSIGNMENTS, data);
      setOnlineStatus(true);
      return data;
    } catch {
      setOnlineStatus(false);
      const cached = await getCache<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS);
      if (cached) setAssignments(cached);
      return cached || [];
    }
  }, [setOnlineStatus]);

  const getAssignmentById = useCallback(
    async (id: string): Promise<Assignment | undefined> => {
      try {
        const item = await assignmentService.getAssignmentById(id);
        return item;
      } catch {
        return assignments.find((a) => a.id === id);
      }
    },
    [assignments]
  );

  const updateAssignmentStatus = useCallback(
    async (id: string, status: 'todo' | 'done'): Promise<boolean> => {
      const updatedList = assignments.map((a) =>
        a.id === id
          ? { ...a, status, updatedAt: new Date().toISOString() }
          : a
      );
      setAssignments(updatedList);
      await setCache(STORAGE_KEYS.ASSIGNMENTS, updatedList);

      try {
        await assignmentService.updateAssignmentStatus(id, status);
        setOnlineStatus(true);
        return true;
      } catch {
        setOnlineStatus(false);
        await outbox.enqueue({
          method: 'PATCH',
          url: `/assignments/${id}`,
          body: { status, updatedAt: new Date().toISOString() },
        });
        await refreshPendingCount();
        return false;
      }
    },
    [assignments, setOnlineStatus, refreshPendingCount]
  );

  const createAssignment = useCallback(
    async (data: CreateAssignmentDTO): Promise<boolean> => {
      const tempId = Date.now().toString();
      const course = courses.find((c) => c.id === data.courseId);
      const newAssignment: Assignment = {
        ...data,
        id: tempId,
        updatedAt: new Date().toISOString(),
        course,
      };

      const updated = [newAssignment, ...assignments];
      setAssignments(updated);
      await setCache(STORAGE_KEYS.ASSIGNMENTS, updated);

      try {
        const created = await assignmentService.createAssignment(data);
        setAssignments((prev) =>
          prev.map((item) => (item.id === tempId ? created : item))
        );
        setOnlineStatus(true);
        return true;
      } catch {
        setOnlineStatus(false);
        await outbox.enqueue({
          method: 'POST',
          url: '/assignments',
          body: { ...data, updatedAt: new Date().toISOString() },
        });
        await refreshPendingCount();
        return false;
      }
    },
    [assignments, courses, setOnlineStatus, refreshPendingCount]
  );

  // --- Điểm số ---
  const fetchGrades = useCallback(async (): Promise<Grade[]> => {
    try {
      const data = await gradeService.getGrades();
      setGrades(data);
      await setCache(STORAGE_KEYS.GRADES, data);
      setOnlineStatus(true);
      return data;
    } catch {
      setOnlineStatus(false);
      const cached = await getCache<Grade[]>(STORAGE_KEYS.GRADES);
      if (cached) setGrades(cached);
      return cached || [];
    }
  }, [setOnlineStatus]);

  const getGradeById = useCallback(
    async (id: string): Promise<Grade | undefined> => {
      try {
        const grade = await gradeService.getGradeById(id);
        return grade;
      } catch {
        return grades.find((g) => g.id === id);
      }
    },
    [grades]
  );

  return (
    <AppDataContext.Provider
      value={{
        student,
        courses,
        sessions,
        assignments,
        grades,
        isLoading,
        fetchStudent,
        updateStudent,
        fetchCourses,
        getCourseById,
        fetchSessions,
        getSessionById,
        fetchAssignments,
        getAssignmentById,
        updateAssignmentStatus,
        createAssignment,
        fetchGrades,
        getGradeById,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
export default AppDataContext;
