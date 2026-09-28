import { Student } from './student';

export type RootStackParamList = {
  StudentManagement: undefined;
  StudentDetail: { student: Student };
  AddStudent: undefined;
  EditStudent: { student: Student };
};
