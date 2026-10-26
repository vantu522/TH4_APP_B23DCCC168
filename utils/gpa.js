/**
 * utils/gpa.js - Bảng quy đổi điểm và tính GPA
 * Điểm hệ 10	Điểm chữ	Điểm hệ 4
 * 8,5 – 10	    A	        4,0
 * 8,0 – 8,4	B+	        3,5
 * 7,0 – 7,9	B	        3,0
 * 6,5 – 6,9	C+	        2,5
 * 5,5 – 6,4	C	        2,0
 * 5,0 – 5,4	D+	        1,5
 * 4,0 – 4,9	D	        1,0
 * Dưới 4,0	    F	        0
 *
 * GPA = tổng (điểm hệ 4 × số tín chỉ) / tổng số tín chỉ.
 * Môn điểm F không tính vào số tín chỉ tích lũy.
 */

function calculateTotalScore(attendance, midterm, final) {
  const total = 0.1 * attendance + 0.3 * midterm + 0.6 * final;
  return Math.round(total * 10) / 10;
}

function toLetter(total) {
  if (total >= 8.5) return 'A';
  if (total >= 8.0) return 'B+';
  if (total >= 7.0) return 'B';
  if (total >= 6.5) return 'C+';
  if (total >= 5.5) return 'C';
  if (total >= 5.0) return 'D+';
  if (total >= 4.0) return 'D';
  return 'F';
}

function toGpa4(total) {
  if (total >= 8.5) return 4.0;
  if (total >= 8.0) return 3.5;
  if (total >= 7.0) return 3.0;
  if (total >= 6.5) return 2.5;
  if (total >= 5.5) return 2.0;
  if (total >= 5.0) return 1.5;
  if (total >= 4.0) return 1.0;
  return 0.0;
}

function getGradeCredits(grade, courses) {
  if (grade && grade.course && typeof grade.course.credits === 'number' && grade.course.credits > 0) {
    return grade.course.credits;
  }
  if (courses && Array.isArray(courses)) {
    const found = courses.find((c) => c.id === grade.courseId);
    if (found && typeof found.credits === 'number' && found.credits > 0) {
      return found.credits;
    }
  }
  return 3;
}

function calculateAverageGpa(grades, courses) {
  if (!Array.isArray(grades)) {
    return { gpa4: 0, avg10: 0, accumulatedCredits: 0, totalCredits: 0, count: 0 };
  }

  const valid = grades.filter((g) => g && typeof g.total === 'number');
  if (valid.length === 0) {
    return { gpa4: 0, avg10: 0, accumulatedCredits: 0, totalCredits: 0, count: 0 };
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

    // Môn điểm F không tính vào số tín chỉ tích lũy
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
}

const calculateGPA = calculateAverageGpa;

module.exports = {
  calculateTotalScore,
  toLetter,
  toGpa4,
  getGradeCredits,
  calculateAverageGpa,
  calculateGPA,
};
