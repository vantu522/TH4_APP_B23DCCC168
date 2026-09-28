import { Gender, StudentFormData, StudentFormErrors } from '../types/student';

export const GENDER_OPTIONS: Gender[] = ['Nam', 'Nữ', 'Khác'];

export const validateStudentForm = (form: StudentFormData, existingIds: string[]): StudentFormErrors => {
  const errors: StudentFormErrors = {};

  // Mã sinh viên
  if (!form.id.trim()) {
    errors.id = 'Mã sinh viên không được để trống';
  } else if (!/^[A-Za-z0-9]+$/.test(form.id.trim())) {
    errors.id = 'Mã sinh viên chỉ được chứa chữ cái và số';
  } else if (existingIds.includes(form.id.trim().toUpperCase())) {
    errors.id = 'Mã sinh viên đã tồn tại';
  }

  // Họ tên
  if (!form.fullName.trim()) {
    errors.fullName = 'Họ và tên không được để trống';
  } else if (form.fullName.trim().length < 3) {
    errors.fullName = 'Họ và tên phải có ít nhất 3 ký tự';
  }

  // Ngày sinh (dd/mm/yyyy hoặc yyyy-mm-dd)
  if (!form.dateOfBirth.trim()) {
    errors.dateOfBirth = 'Ngày sinh không được để trống';
  } else {
    const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (!ddmmyyyy.test(form.dateOfBirth) && !yyyymmdd.test(form.dateOfBirth)) {
      errors.dateOfBirth = 'Ngày sinh không hợp lệ (dd/mm/yyyy hoặc yyyy-mm-dd)';
    }
  }

  // Giới tính
  if (!form.gender) {
    errors.gender = 'Vui lòng chọn giới tính';
  }

  // Email
  if (!form.email.trim()) {
    errors.email = 'Email không được để trống';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Email không hợp lệ';
  }

  // Số điện thoại
  if (!form.phone.trim()) {
    errors.phone = 'Số điện thoại không được để trống';
  } else if (!/^(0[3|5|7|8|9])\d{8}$/.test(form.phone.trim())) {
    errors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)';
  }

  // Lớp
  if (!form.className.trim()) {
    errors.className = 'Lớp không được để trống';
  }

  // Khoa
  if (!form.department.trim()) {
    errors.department = 'Khoa không được để trống';
  }

  // GPA
  if (!form.gpa.trim()) {
    errors.gpa = 'GPA không được để trống';
  } else {
    const gpaNum = parseFloat(form.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
      errors.gpa = 'GPA phải là số từ 0.0 đến 4.0';
    }
  }

  return errors;
};
