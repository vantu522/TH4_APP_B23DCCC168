import { Grade, Course } from '../api/types';

/**
 * Tính điểm tổng kết học phần: 10% chuyên cần + 30% giữa kỳ + 60% cuối kỳ
 */
export const calculateTotalScore = (
  attendance: number,
  midterm: number,
  final: number
): number => {
  const total = 0.1 * attendance + 0.3 * midterm + 0.6 * final;
  return Math.round(total * 10) / 10;
};

/**
 * Quy đổi điểm hệ 10 sang điểm chữ (Thang điểm đại học)
 * 8,5 – 10   -> A
 * 8,0 – 8,4  -> B+
 * 7,0 – 7,9  -> B
 * 6,5 – 6,9  -> C+
 * 5,5 – 6,4  -> C
 * 5,0 – 5,4  -> D+
 * 4,0 – 4,9  -> D
 * Dưới 4,0   -> F
 */
export const toLetter = (total: number): string => {
  if (total >= 8.5) return 'A';
  if (total >= 8.0) return 'B+';
  if (total >= 7.0) return 'B';
  if (total >= 6.5) return 'C+';
  if (total >= 5.5) return 'C';
  if (total >= 5.0) return 'D+';
  if (total >= 4.0) return 'D';
  return 'F';
};

/**
 * Quy đổi điểm hệ 10 sang thang 4
 * 8,5 – 10   -> 4,0
 * 8,0 – 8,4  -> 3,5
 * 7,0 – 7,9  -> 3,0
 * 6,5 – 6,9  -> 2,5
 * 5,5 – 6,4  -> 2,0
 * 5,0 – 5,4  -> 1,5
 * 4,0 – 4,9  -> 1,0
 * Dưới 4,0   -> 0
 */
export const toGpa4 = (total: number): number => {
  if (total >= 8.5) return 4.0;
  if (total >= 8.0) return 3.5;
  if (total >= 7.0) return 3.0;
  if (total >= 6.5) return 2.5;
  if (total >= 5.5) return 2.0;
  if (total >= 5.0) return 1.5;
  if (total >= 4.0) return 1.0;
  return 0.0;
};

export interface GpaResult {
  gpa4: number;               // GPA hệ 4 có trọng số theo số tín chỉ
  avg10: number;              // Điểm trung bình hệ 10
  accumulatedCredits: number; // Tổng số tín chỉ tích lũy (không tính môn F)
  totalCredits: number;       // Tổng số tín chỉ đăng ký tính GPA
  count: number;              // Tổng số môn học
}

/**
 * Lấy số tín chỉ của môn học từ grade hoặc danh sách courses
 */
export const getGradeCredits = (
  grade: Grade,
  courses?: Course[]
): number => {
  if (typeof grade.course?.credits === 'number' && grade.course.credits > 0) {
    return grade.course.credits;
  }
  if (courses && courses.length > 0) {
    const found = courses.find((c) => c.id === grade.courseId);
    if (typeof found?.credits === 'number' && found.credits > 0) {
      return found.credits;
    }
  }
  return 3; // Mặc định 3 tín chỉ nếu không tìm thấy
};

/**
 * Tính GPA hệ 4 có trọng số theo số tín chỉ và tổng số tín chỉ tích lũy.
 * Công thức: GPA = tổng (điểm hệ 4 × số tín chỉ) / tổng số tín chỉ
 * Môn điểm F không tính vào số tín chỉ tích lũy.
 */
export const calculateAverageGpa = (
  grades: Grade[],
  courses?: Course[]
): GpaResult => {
  const valid = grades.filter((g) => typeof g.total === 'number');
  if (valid.length === 0) {
    return {
      gpa4: 0,
      avg10: 0,
      accumulatedCredits: 0,
      totalCredits: 0,
      count: 0,
    };
  }

  let totalWeightedGpa4 = 0;
  let totalCredits = 0;
  let accumulatedCredits = 0;
  let sumScore10 = 0;

  for (const grade of valid) {
    const credits = getGradeCredits(grade, courses);
    const score10 = grade.total;
    const gpa4 = toGpa4(score10);
    const letter = toLetter(score10);

    totalWeightedGpa4 += gpa4 * credits;
    totalCredits += credits;
    sumScore10 += score10;

    // Môn điểm F (hoặc điểm hệ 10 dưới 4.0) không tính vào số tín chỉ tích lũy
    if (letter !== 'F' && score10 >= 4.0) {
      accumulatedCredits += credits;
    }
  }

  const finalGpa4 = totalCredits > 0 ? totalWeightedGpa4 / totalCredits : 0;
  const avg10 = valid.length > 0 ? sumScore10 / valid.length : 0;

  return {
    gpa4: Math.round(finalGpa4 * 100) / 100,
    avg10: Math.round(avg10 * 10) / 10,
    accumulatedCredits,
    totalCredits,
    count: valid.length,
  };
};

export const calculateGPA = calculateAverageGpa;
