/**
 * Type-safe định nghĩa các Route names
 */
export const ROUTES = {
  // 5 Tabs chính
  TAB_HOME: 'TabHome',
  TAB_COURSE: 'TabCourse',
  TAB_SCHEDULE: 'TabSchedule',
  TAB_ASSIGNMENT: 'TabAssignment',
  TAB_PROFILE: 'TabProfile',

  // Tab 1: Tổng quan
  HOME: 'HomeScreen',

  // Tab 2: Môn học
  COURSE_LIST: 'CourseListScreen',
  COURSE_DETAIL: 'CourseDetail',

  // Tab 3: Thời khóa biểu
  SCHEDULE: 'ScheduleScreen',
  SESSION_DETAIL: 'SessionDetail',

  // Tab 4: Bài tập
  ASSIGNMENT_LIST: 'AssignmentListScreen',
  ASSIGNMENT_DETAIL: 'AssignmentDetail',
  ASSIGNMENT_FORM: 'AssignmentForm',

  // Tab 5: Cá nhân
  PROFILE: 'ProfileScreen',
  EDIT_PROFILE: 'EditProfile',
  GRADE_LIST: 'GradeList',
  GRADE_DETAIL: 'GradeDetail',
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];

export default ROUTES;
