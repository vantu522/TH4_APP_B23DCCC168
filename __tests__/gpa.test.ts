import {
  toLetter,
  toGpa4,
  calculateTotalScore,
  calculateAverageGpa,
} from '../src/utils/gpa';
import { Grade, Course } from '../src/api/types';

describe('Bảng quy đổi điểm utils/gpa', () => {
  test('Quy đổi điểm hệ 10 sang điểm chữ (toLetter)', () => {
    // 8,5 – 10 -> A
    expect(toLetter(10)).toBe('A');
    expect(toLetter(8.5)).toBe('A');
    expect(toLetter(9.0)).toBe('A');

    // 8,0 – 8,4 -> B+
    expect(toLetter(8.4)).toBe('B+');
    expect(toLetter(8.0)).toBe('B+');

    // 7,0 – 7,9 -> B
    expect(toLetter(7.9)).toBe('B');
    expect(toLetter(7.0)).toBe('B');

    // 6,5 – 6,9 -> C+
    expect(toLetter(6.9)).toBe('C+');
    expect(toLetter(6.5)).toBe('C+');

    // 5,5 – 6,4 -> C
    expect(toLetter(6.4)).toBe('C');
    expect(toLetter(5.5)).toBe('C');

    // 5,0 – 5,4 -> D+
    expect(toLetter(5.4)).toBe('D+');
    expect(toLetter(5.0)).toBe('D+');

    // 4,0 – 4,9 -> D
    expect(toLetter(4.9)).toBe('D');
    expect(toLetter(4.0)).toBe('D');

    // Dưới 4,0 -> F
    expect(toLetter(3.9)).toBe('F');
    expect(toLetter(0)).toBe('F');
  });

  test('Quy đổi điểm hệ 10 sang điểm hệ 4 (toGpa4)', () => {
    // 8,5 – 10 -> 4,0
    expect(toGpa4(10)).toBe(4.0);
    expect(toGpa4(8.5)).toBe(4.0);

    // 8,0 – 8,4 -> 3,5
    expect(toGpa4(8.4)).toBe(3.5);
    expect(toGpa4(8.0)).toBe(3.5);

    // 7,0 – 7,9 -> 3,0
    expect(toGpa4(7.9)).toBe(3.0);
    expect(toGpa4(7.0)).toBe(3.0);

    // 6,5 – 6,9 -> 2,5
    expect(toGpa4(6.9)).toBe(2.5);
    expect(toGpa4(6.5)).toBe(2.5);

    // 5,5 – 6,4 -> 2,0
    expect(toGpa4(6.4)).toBe(2.0);
    expect(toGpa4(5.5)).toBe(2.0);

    // 5,0 – 5,4 -> 1,5
    expect(toGpa4(5.4)).toBe(1.5);
    expect(toGpa4(5.0)).toBe(1.5);

    // 4,0 – 4,9 -> 1,0
    expect(toGpa4(4.9)).toBe(1.0);
    expect(toGpa4(4.0)).toBe(1.0);

    // Dưới 4,0 -> 0
    expect(toGpa4(3.9)).toBe(0);
    expect(toGpa4(0)).toBe(0);
  });

  test('Tính điểm tổng kết học phần (10% CC + 30% GK + 60% CK)', () => {
    expect(calculateTotalScore(10, 8.5, 9)).toBe(9.0);
    expect(calculateTotalScore(9, 8, 8.5)).toBe(8.4);
    expect(calculateTotalScore(9.5, 7.5, 8)).toBe(8.0);
    expect(calculateTotalScore(10, 9, 9.5)).toBe(9.4);
    expect(calculateTotalScore(8.5, 7, 7.5)).toBe(7.5);
  });

  test('Tính GPA có trọng số tín chỉ và loại trừ môn F khỏi tín chỉ tích lũy', () => {
    const mockGrades: Grade[] = [
      {
        id: '1',
        courseId: '1',
        semester: 'HK1',
        attendance: 10,
        midterm: 8.5,
        final: 9,
        total: 9.0, // A -> 4.0
        letter: 'A',
        course: { id: '1', code: 'INT3120', name: 'RN', credits: 3, lecturer: '', description: '', semester: 'HK1' },
      },
      {
        id: '2',
        courseId: '2',
        semester: 'HK1',
        attendance: 9,
        midterm: 8,
        final: 8.5,
        total: 8.4, // B+ -> 3.5
        letter: 'B+',
        course: { id: '2', code: 'INT3105', name: 'PTTK', credits: 3, lecturer: '', description: '', semester: 'HK1' },
      },
      {
        id: '3',
        courseId: '3',
        semester: 'HK1',
        attendance: 0,
        midterm: 2,
        final: 3,
        total: 2.4, // F -> 0.0
        letter: 'F',
        course: { id: '3', code: 'INT3206', name: 'CSDL', credits: 4, lecturer: '', description: '', semester: 'HK1' },
      },
    ];

    // Môn 1: 4.0 * 3 = 12
    // Môn 2: 3.5 * 3 = 10.5
    // Môn 3: 0.0 * 4 = 0
    // Tổng trọng số = 22.5
    // Tổng số tín chỉ = 3 + 3 + 4 = 10
    // GPA = 22.5 / 10 = 2.25
    // Tín chỉ tích lũy (môn F không tính): 3 + 3 = 6 tín chỉ
    const result = calculateAverageGpa(mockGrades);

    expect(result.gpa4).toBe(2.25);
    expect(result.accumulatedCredits).toBe(6);
    expect(result.totalCredits).toBe(10);
    expect(result.count).toBe(3);
  });

  test('Tính GPA với dữ liệu từ db.json (toàn bộ qua môn)', () => {
    const gradesFromDb: Grade[] = [
      { id: '1', courseId: '1', semester: 'HK1', attendance: 10, midterm: 8.5, final: 9, total: 9.0, letter: 'A', course: { id: '1', code: '', name: '', credits: 3, lecturer: '', description: '', semester: '' } },
      { id: '2', courseId: '2', semester: 'HK1', attendance: 9, midterm: 8, final: 8.5, total: 8.4, letter: 'B+', course: { id: '2', code: '', name: '', credits: 3, lecturer: '', description: '', semester: '' } },
      { id: '3', courseId: '3', semester: 'HK1', attendance: 9.5, midterm: 7.5, final: 8, total: 8.0, letter: 'B+', course: { id: '3', code: '', name: '', credits: 3, lecturer: '', description: '', semester: '' } },
      { id: '4', courseId: '4', semester: 'HK1', attendance: 10, midterm: 9, final: 9.5, total: 9.4, letter: 'A', course: { id: '4', code: '', name: '', credits: 4, lecturer: '', description: '', semester: '' } },
      { id: '5', courseId: '5', semester: 'HK1', attendance: 8.5, midterm: 7, final: 7.5, total: 7.5, letter: 'B', course: { id: '5', code: '', name: '', credits: 3, lecturer: '', description: '', semester: '' } },
    ];

    // (4.0*3 + 3.5*3 + 3.5*3 + 4.0*4 + 3.0*3) / (3 + 3 + 3 + 4 + 3)
    // = (12 + 10.5 + 10.5 + 16 + 9) / 16 = 58 / 16 = 3.625 -> 3.63
    const result = calculateAverageGpa(gradesFromDb);

    expect(result.gpa4).toBe(3.63);
    expect(result.accumulatedCredits).toBe(16);
    expect(result.totalCredits).toBe(16);
    expect(result.count).toBe(5);
  });
});
