/**
 * Các tiện ích xử lý định dạng ngày tháng và thời gian theo chuẩn ISO 8601
 */

export const DAYS_MAP: Record<number, string> = {
  2: 'Thứ 2',
  3: 'Thứ 3',
  4: 'Thứ 4',
  5: 'Thứ 5',
  6: 'Thứ 6',
  7: 'Thứ 7',
  8: 'Chủ nhật',
};

export const getDayName = (dayOfWeek: number): string => {
  return DAYS_MAP[dayOfWeek] || `Thứ ${dayOfWeek}`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('vi-VN');
  } catch {
    return dateString;
  }
};

/**
 * Định dạng thời điểm cập nhật lần cuối chuẩn đề bài B2: "14:32, 26/10/2026"
 */
export const formatLastUpdated = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

export const isOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  try {
    const due = new Date(dueDate);
    return due < new Date();
  } catch {
    return false;
  }
};

export const isDueSoon = (dueDate?: string, days: number = 7): boolean => {
  if (!dueDate) return false;
  try {
    const now = new Date();
    const due = new Date(dueDate);
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return due >= now && due <= future;
  } catch {
    return false;
  }
};
