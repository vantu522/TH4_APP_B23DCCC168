/**
 * Định nghĩa tên các khóa lưu trữ AsyncStorage theo chuẩn đề bài
 */
export const STORAGE_KEYS = {
  // Cache API data (Lưu { data, savedAt })
  STUDENT: 'cache:student',
  COURSES: 'cache:courses',
  SESSIONS: 'cache:sessions',
  ASSIGNMENTS: 'cache:assignments',
  GRADES: 'cache:grades',

  // Hàng đợi ngoại tuyến (Outbox Queue)
  OUTBOX_QUEUE: 'outbox:queue',
};

export default STORAGE_KEYS;
