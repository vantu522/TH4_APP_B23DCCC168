export const getAcademicRanking = (gpa: number): string => {
  // Ứng dụng hiện đang lưu điểm theo thang 4.0 (từ 0 đến 4).
  // Theo thang 4.0 thông thường: >= 3.2 hoặc 3.6 là Giỏi/Xuất sắc.
  // Ở đây chúng ta quy đổi tương đối thang 4 sang thang 10 (gpa * 2.5)
  // để khớp với yêu cầu ">= 8.5 là giỏi" của bạn.
  
  const gpa10 = gpa <= 4.0 ? gpa * 2.5 : gpa; // Tự động nhận diện nếu bạn nhập thẳng hệ 10

  if (gpa10 >= 8.5) return 'Giỏi';
  if (gpa10 >= 7.0) return 'Khá';
  if (gpa10 >= 5.0) return 'Trung bình';
  return 'Yếu';
};
