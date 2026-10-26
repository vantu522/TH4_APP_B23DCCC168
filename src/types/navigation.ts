import { ROUTES } from '../navigation/routes';

export type HomeStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.COURSE_DETAIL]: { id: string };
  [ROUTES.ASSIGNMENT_DETAIL]: { id: string };
};

export type CourseStackParamList = {
  [ROUTES.COURSE_LIST]: undefined;
  [ROUTES.COURSE_DETAIL]: { id: string };
};

export type ScheduleStackParamList = {
  [ROUTES.SCHEDULE]: undefined;
  [ROUTES.SESSION_DETAIL]: { id: string };
};

export type AssignmentStackParamList = {
  [ROUTES.ASSIGNMENT_LIST]: undefined;
  [ROUTES.ASSIGNMENT_DETAIL]: { id: string };
  [ROUTES.ASSIGNMENT_FORM]: undefined;
};

export type ProfileStackParamList = {
  [ROUTES.PROFILE]: undefined;
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.GRADE_LIST]: undefined;
  [ROUTES.GRADE_DETAIL]: { id: string };
};

export type RootTabParamList = {
  [ROUTES.TAB_HOME]: undefined;
  [ROUTES.TAB_COURSE]: undefined;
  [ROUTES.TAB_SCHEDULE]: undefined;
  [ROUTES.TAB_ASSIGNMENT]: undefined;
  [ROUTES.TAB_PROFILE]: undefined;
};

// Khả năng tương thích ngược với các màn hình cũ
export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  StudentManagement: undefined;
  StudentDetail: { student?: any; id?: string };
  AddStudent: undefined;
  EditStudent: { student?: any };
  Setting: undefined;
};
