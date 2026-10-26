/**
 * Các hàm kiểm tra tính hợp lệ dữ liệu (Validation)
 */

export const validateRequired = (value?: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const validateEmail = (email?: string): boolean => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const validatePhone = (phone?: string): boolean => {
  if (!phone) return false;
  const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return regex.test(phone.trim());
};

export const validateAssignment = (
  title?: string,
  courseId?: string,
  dueDate?: string
): string | null => {
  if (!validateRequired(title)) {
    return 'Tiêu đề bài tập không được để trống';
  }
  if (!validateRequired(courseId)) {
    return 'Vui lòng chọn môn học';
  }
  if (dueDate) {
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return 'Hạn nộp không đúng định dạng ngày hợp lệ';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueWithoutTime = new Date(due);
    dueWithoutTime.setHours(0, 0, 0, 0);

    if (dueWithoutTime.getTime() < today.getTime()) {
      return 'Hạn nộp không được ở trong quá khứ';
    }
  }
  return null;
};

export const validateStudentProfile = (
  fullName?: string,
  email?: string,
  phone?: string
): string | null => {
  if (!validateRequired(fullName)) {
    return 'Họ tên không được để trống';
  }
  if (!validateRequired(email)) {
    return 'Email không được để trống';
  }
  if (!validateEmail(email)) {
    return 'Email không đúng định dạng';
  }
  if (phone && !validatePhone(phone)) {
    return 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0 hoặc +84)';
  }
  return null;
};
