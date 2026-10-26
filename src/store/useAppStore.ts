import { create } from 'zustand';
import { Alert } from 'react-native';
import NetInfo from '../utils/safeNetInfo';
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
import { request } from '../api/client';
import { getCacheWithMeta, setCache } from '../storage/cache';
import { STORAGE_KEYS } from '../storage/keys';
import outbox, { OutboxItem } from '../storage/outbox';
import { calculateTotalScore as calculateTotalGrade, toLetter as getLetterGrade } from '../utils/gpa';

export { calculateTotalGrade, getLetterGrade };

interface AppState {
  student: Student | null;
  courses: Course[];
  sessions: Session[];
  assignments: Assignment[];
  grades: Grade[];
  pendingSyncIds: string[];
  lastSavedAt: {
    student?: string;
    courses?: string;
    sessions?: string;
    assignments?: string;
    grades?: string;
  };
  isLoading: boolean;
  isOnline: boolean;

  // Actions nạp dữ liệu
  initStore: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
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

  // Đồng bộ & trạng thái ngoại tuyến
  syncPendingActions: () => Promise<void>;
  refreshPendingSyncIds: () => Promise<void>;
  getUncompletedAssignmentsCount: () => number;
  getPendingSyncCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  student: null,
  courses: [],
  sessions: [],
  assignments: [],
  grades: [],
  pendingSyncIds: [],
  lastSavedAt: {},
  isLoading: false,
  isOnline: true,

  setOnlineStatus: (status: boolean) => {
    set({ isOnline: status });
  },

  refreshPendingSyncIds: async () => {
    const ids = await outbox.getPendingEntityIds();
    set({ pendingSyncIds: ids });
  },

  // Khởi tạo đọc cache ban đầu và danh sách outbox (B2 - Cache trước, mạng sau)
  initStore: async () => {
    try {
      const [cStudent, cCourses, cSessions, cAssignments, cGrades, pendingIds] =
        await Promise.all([
          getCacheWithMeta<Student>(STORAGE_KEYS.STUDENT),
          getCacheWithMeta<Course[]>(STORAGE_KEYS.COURSES),
          getCacheWithMeta<Session[]>(STORAGE_KEYS.SESSIONS),
          getCacheWithMeta<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS),
          getCacheWithMeta<Grade[]>(STORAGE_KEYS.GRADES),
          outbox.getPendingEntityIds(),
        ]);

      set((state) => ({
        student: cStudent?.data || state.student,
        courses: cCourses?.data || state.courses,
        sessions: cSessions?.data || state.sessions,
        assignments: cAssignments?.data || state.assignments,
        grades: cGrades?.data || state.grades,
        pendingSyncIds: pendingIds,
        lastSavedAt: {
          student: cStudent?.savedAt,
          courses: cCourses?.savedAt,
          sessions: cSessions?.savedAt,
          assignments: cAssignments?.savedAt,
          grades: cGrades?.savedAt,
        },
      }));
    } catch (err) {
      console.log('[Store] Lỗi đọc cache ban đầu:', err);
    }
  },

  // --- 1. SINH VIÊN (Profile) ---
  fetchStudent: async (id = '1') => {
    // B2: Cache trước - nạp từ cache trước nếu chưa có
    const cached = await getCacheWithMeta<Student>(STORAGE_KEYS.STUDENT);
    if (cached && !get().student) {
      set((state) => ({
        student: cached.data,
        lastSavedAt: { ...state.lastSavedAt, student: cached.savedAt },
      }));
    }

    // Mạng sau - gọi API nếu có mạng
    try {
      const data = await studentService.getStudentById(id);
      await setCache(STORAGE_KEYS.STUDENT, data);
      set((state) => ({
        student: data,
        isOnline: true,
        lastSavedAt: { ...state.lastSavedAt, student: new Date().toISOString() },
      }));
      return data;
    } catch (error) {
      console.log('[Store] Mất kết nối khi tải thông tin sinh viên, dùng cache');
      set({ isOnline: false });
      return get().student;
    }
  },

  updateStudent: async (data: Partial<Student>) => {
    const currentStudent = get().student;
    const updatedAt = new Date().toISOString();
    const updated = {
      ...(currentStudent || {
        id: '1',
        studentCode: 'SV001',
        className: '',
        major: '',
        email: '',
        phone: '',
        fullName: '',
        updatedAt: '',
      }),
      ...data,
      updatedAt,
    } as Student;

    // Cập nhật ngay trong cache giao diện (Optimistic)
    set({ student: updated });
    await setCache(STORAGE_KEYS.STUDENT, updated);

    // Kiểm tra kết nối mạng
    const netState = await NetInfo.fetch();
    const online = Boolean(netState.isConnected && netState.isInternetReachable !== false);

    if (!online) {
      // B3: Đưa vào hàng đợi Outbox theo đúng yêu cầu đề bài: { id, method, url, body, createdAt }
      await outbox.enqueue({
        method: 'PATCH',
        url: `/students/${updated.id}`,
        body: { ...data, updatedAt },
      });
      await get().refreshPendingSyncIds();
      set({ isOnline: false });
      return false;
    }

    try {
      await studentService.updateStudent(updated.id, data);
      set({ isOnline: true });
      return true;
    } catch (error) {
      // Gặp lỗi kết nối -> đưa vào hàng đợi outbox
      await outbox.enqueue({
        method: 'PATCH',
        url: `/students/${updated.id}`,
        body: { ...data, updatedAt },
      });
      await get().refreshPendingSyncIds();
      set({ isOnline: false });
      return false;
    }
  },

  // --- 2. MÔN HỌC (Courses) ---
  fetchCourses: async () => {
    // B2: Cache trước
    const cached = await getCacheWithMeta<Course[]>(STORAGE_KEYS.COURSES);
    if (cached && get().courses.length === 0) {
      set((state) => ({
        courses: cached.data,
        lastSavedAt: { ...state.lastSavedAt, courses: cached.savedAt },
      }));
    }

    // Mạng sau
    try {
      const data = await courseService.getCourses();
      await setCache(STORAGE_KEYS.COURSES, data);
      set((state) => ({
        courses: data,
        isOnline: true,
        lastSavedAt: { ...state.lastSavedAt, courses: new Date().toISOString() },
      }));
      return data;
    } catch (error) {
      console.log('[Store] Dùng danh sách môn học từ cache');
      set({ isOnline: false });
      return get().courses;
    }
  },

  getCourseById: async (id: string) => {
    try {
      const course = await courseService.getCourseById(id);
      return course;
    } catch (error) {
      return get().courses.find((c) => c.id === id);
    }
  },

  // --- 3. LỊCH HỌC (Sessions) ---
  fetchSessions: async () => {
    // B2: Cache trước
    const cached = await getCacheWithMeta<Session[]>(STORAGE_KEYS.SESSIONS);
    if (cached && get().sessions.length === 0) {
      set((state) => ({
        sessions: cached.data,
        lastSavedAt: { ...state.lastSavedAt, sessions: cached.savedAt },
      }));
    }

    // Mạng sau
    try {
      const data = await sessionService.getSessions();
      await setCache(STORAGE_KEYS.SESSIONS, data);
      set((state) => ({
        sessions: data,
        isOnline: true,
        lastSavedAt: { ...state.lastSavedAt, sessions: new Date().toISOString() },
      }));
      return data;
    } catch (error) {
      console.log('[Store] Dùng lịch học từ cache');
      set({ isOnline: false });
      return get().sessions;
    }
  },

  getSessionById: async (id: string) => {
    try {
      const session = await sessionService.getSessionById(id);
      return session;
    } catch (error) {
      return get().sessions.find((s) => s.id === id);
    }
  },

  // --- 4. BÀI TẬP (Assignments) ---
  fetchAssignments: async () => {
    // B2: Cache trước
    const cached = await getCacheWithMeta<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS);
    if (cached && get().assignments.length === 0) {
      set((state) => ({
        assignments: cached.data,
        lastSavedAt: { ...state.lastSavedAt, assignments: cached.savedAt },
      }));
    }

    // Mạng sau
    try {
      const data = await assignmentService.getAssignments();
      await setCache(STORAGE_KEYS.ASSIGNMENTS, data);
      await get().refreshPendingSyncIds();
      set((state) => ({
        assignments: data,
        isOnline: true,
        lastSavedAt: { ...state.lastSavedAt, assignments: new Date().toISOString() },
      }));
      return data;
    } catch (error) {
      console.log('[Store] Dùng danh sách bài tập từ cache');
      set({ isOnline: false });
      return get().assignments;
    }
  },

  getAssignmentById: async (id: string) => {
    try {
      const item = await assignmentService.getAssignmentById(id);
      return item;
    } catch (error) {
      return get().assignments.find((a) => a.id === id);
    }
  },

  // A6: Cập nhật lạc quan (Optimistic Update) khi đổi trạng thái bài tập:
  // Giao diện đổi ngay khi bấm; nếu API báo lỗi thì hoàn tác và hiển thị thông báo.
  updateAssignmentStatus: async (id: string, status: 'todo' | 'done') => {
    const prevAssignments = get().assignments;
    const currentItem = prevAssignments.find((a) => a.id === id);
    if (!currentItem) return false;

    const previousStatus = currentItem.status;
    const updatedAt = new Date().toISOString();

    // 1. Cập nhật lạc quan ngay lập tức trên UI
    const updatedAssignments = prevAssignments.map((item) =>
      item.id === id ? { ...item, status, updatedAt } : item
    );
    set({ assignments: updatedAssignments });
    await setCache(STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);

    // Kiểm tra trạng thái mạng
    const netState = await NetInfo.fetch();
    const online = Boolean(netState.isConnected && netState.isInternetReachable !== false);

    // Nếu đang offline -> B3: Không chặn, đưa vào hàng đợi Outbox
    if (!online) {
      await outbox.enqueue({
        method: 'PATCH',
        url: `/assignments/${id}`,
        body: { status, updatedAt },
      });
      await get().refreshPendingSyncIds();
      set({ isOnline: false });
      return true;
    }

    // Nếu đang online -> Gọi API
    try {
      await assignmentService.updateAssignmentStatus(id, status);
      set({ isOnline: true });
      return true;
    } catch (error) {
      // 2. Nếu API báo lỗi -> HOÀN TÁC (Rollback) lại trạng thái cũ và hiển thị thông báo!
      console.log('[Store] API báo lỗi cập nhật trạng thái, tiến hành hoàn tác');
      set({ assignments: prevAssignments });
      await setCache(STORAGE_KEYS.ASSIGNMENTS, prevAssignments);

      Alert.alert(
        'Lỗi cập nhật',
        'Không thể cập nhật trạng thái bài tập lên máy chủ. Giao diện đã được hoàn tác về trạng thái trước đó.'
      );
      return false;
    }
  },

  // A5 & B3: Thêm bài tập mới (gửi POST, không bị chặn khi offline)
  createAssignment: async (data: CreateAssignmentDTO) => {
    const tempId = `temp-${Date.now()}`;
    const course = get().courses.find((c) => c.id === data.courseId);
    const updatedAt = new Date().toISOString();

    const newAssignment: Assignment = {
      ...data,
      id: tempId,
      updatedAt,
      course,
    };

    // Thêm ngay vào giao diện (Optimistic)
    const nextList = [newAssignment, ...get().assignments];
    set({ assignments: nextList });
    await setCache(STORAGE_KEYS.ASSIGNMENTS, nextList);

    // Kiểm tra mạng
    const netState = await NetInfo.fetch();
    const online = Boolean(netState.isConnected && netState.isInternetReachable !== false);

    if (!online) {
      // B3: Đưa vào hàng đợi Outbox
      await outbox.enqueue({
        id: tempId,
        method: 'POST',
        url: '/assignments',
        body: { ...data, updatedAt },
      });
      await get().refreshPendingSyncIds();
      set({ isOnline: false });
      return false; // Lưu ngoại tuyến thành công
    }

    try {
      // Gửi POST lên server
      const created = await assignmentService.createAssignment(data);
      // Thay thế ID tạm bằng dữ liệu thật từ server
      const finalList = get().assignments.map((item) =>
        item.id === tempId ? created : item
      );
      set({ assignments: finalList, isOnline: true });
      await setCache(STORAGE_KEYS.ASSIGNMENTS, finalList);
      return true;
    } catch (error) {
      // Nếu lỗi mạng -> giữ lại trong cache và đưa vào outbox
      await outbox.enqueue({
        id: tempId,
        method: 'POST',
        url: '/assignments',
        body: { ...data, updatedAt },
      });
      await get().refreshPendingSyncIds();
      set({ isOnline: false });
      return false;
    }
  },

  // --- 5. BẢNG ĐIỂM (Grades) ---
  fetchGrades: async () => {
    // B2: Cache trước
    const cached = await getCacheWithMeta<Grade[]>(STORAGE_KEYS.GRADES);
    if (cached && get().grades.length === 0) {
      set((state) => ({
        grades: cached.data,
        lastSavedAt: { ...state.lastSavedAt, grades: cached.savedAt },
      }));
    }

    // Mạng sau
    try {
      const data = await gradeService.getGrades();
      await setCache(STORAGE_KEYS.GRADES, data);
      set((state) => ({
        grades: data,
        isOnline: true,
        lastSavedAt: { ...state.lastSavedAt, grades: new Date().toISOString() },
      }));
      return data;
    } catch (error) {
      console.log('[Store] Dùng bảng điểm từ cache');
      set({ isOnline: false });
      return get().grades;
    }
  },

  getGradeById: async (id: string) => {
    try {
      const grade = await gradeService.getGradeById(id);
      return grade;
    } catch (error) {
      return get().grades.find((g) => g.id === id);
    }
  },

  // --- B4 & B5: TỰ ĐỒNG BỘ VÀ XỬ LÝ XUNG ĐỘT DỮ LIỆU ---
  // - Khi có mạng trở lại, ứng dụng gửi lần lượt các thao tác trong hàng đợi theo đúng thứ tự (FIFO)
  // - Thao tác thành công thì xóa khỏi hàng đợi; thao tác lỗi thì giữ lại để thử lại sau
  // - Xử lý xung đột: So sánh trường updatedAt. Nếu dữ liệu server mới hơn thì ưu tiên server và báo cho user
  // - Sau khi đồng bộ, hiển thị thông báo "Đã đồng bộ X thay đổi"
  syncPendingActions: async () => {
    const items: OutboxItem[] = await outbox.getAll();
    if (items.length === 0) return;

    let successCount = 0;

    for (const item of items) {
      try {
        // B5: Kiểm tra xung đột trước khi cập nhật (PATCH/PUT)
        if (item.method === 'PATCH' || item.method === 'PUT') {
          try {
            // Lấy dữ liệu hiện tại trên server
            const serverEntity = await request<any>('GET', item.url);
            if (serverEntity && serverEntity.updatedAt) {
              const serverTime = new Date(serverEntity.updatedAt).getTime();
              const offlineTime = new Date(item.createdAt).getTime();

              if (serverTime > offlineTime) {
                // XUNG ĐỘT: Dữ liệu server mới hơn thao tác offline!
                console.log(
                  `[Conflict] Xung đột tại ${item.url}: Server (${serverEntity.updatedAt}) > Offline (${item.createdAt})`
                );

                // Ưu tiên dữ liệu server: Xóa khỏi hàng đợi outbox
                await outbox.remove(item.id);

                // Thông báo cho người dùng
                const titleOrName =
                  serverEntity.title ||
                  serverEntity.fullName ||
                  serverEntity.name ||
                  `Mục #${serverEntity.id}`;

                Alert.alert(
                  'Xung đột dữ liệu',
                  `Dữ liệu "${titleOrName}" trên máy chủ đã được cập nhật mới hơn thao tác offline của bạn. Ứng dụng đã ưu tiên giữ nguyên dữ liệu từ máy chủ.`
                );

                continue;
              }
            }
          } catch (checkErr) {
            // Nếu không check được GET, tiếp tục thực hiện ghi bình thường
          }
        }

        // Thực hiện gửi thao tác lên server (FIFO)
        if (item.method === 'POST') {
          const res = await request<any>('POST', item.url, item.body);
          // Cập nhật lại ID nếu là bài tập tạm
          if (item.id && item.id.startsWith('temp-')) {
            set((state) => ({
              assignments: state.assignments.map((a) =>
                a.id === item.id ? { ...res, course: a.course } : a
              ),
            }));
          }
        } else {
          await request(item.method, item.url, item.body);
        }

        // Thành công: Xóa khỏi hàng đợi outbox
        await outbox.remove(item.id);
        successCount++;
      } catch (err) {
        console.warn(`[Sync] Lỗi đồng bộ mục ${item.id}, giữ lại trong hàng đợi để thử lại:`, err);
        // Thao tác lỗi -> Giữ lại trong hàng đợi
      }
    }

    await get().refreshPendingSyncIds();

    // Làm mới dữ liệu toàn cục từ server sau khi đồng bộ
    try {
      await Promise.all([
        get().fetchStudent('1'),
        get().fetchCourses(),
        get().fetchAssignments(),
      ]);
    } catch {}

    // B4: Sau khi đồng bộ, hiển thị thông báo “Đã đồng bộ X thay đổi”
    if (successCount > 0) {
      Alert.alert(
        'Đồng bộ hoàn tất',
        `Đã đồng bộ ${successCount} thay đổi lên máy chủ thành công.`
      );
    }
  },

  getUncompletedAssignmentsCount: () => {
    return get().assignments.filter((a) => a.status === 'todo').length;
  },

  getPendingSyncCount: () => {
    return get().pendingSyncIds.length;
  },
}));
