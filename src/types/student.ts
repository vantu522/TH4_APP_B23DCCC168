export type Gender = 'Nam' | 'Nữ' | 'Khác';

export interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string;
  phone: string;
  className: string;
  department: string; // Khoa
  gpa: number;
}

export interface StudentFormData {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender | '';
  email: string;
  phone: string;
  className: string;
  department: string;
  gpa: string;
}

export interface StudentFormErrors {
  id?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  className?: string;
  department?: string;
  gpa?: string;
}


export const mockStudents: Student[] = [
  { id: 'SV001', fullName: 'Nguyễn Văn An', dateOfBirth: '2000-01-15', gender: 'Nam', email: 'an.nv@example.com', phone: '0901234567', className: 'K65-CNTT', department: 'Công nghệ thông tin', gpa: 3.8 },
  { id: 'SV002', fullName: 'Trần Thị Bích', dateOfBirth: '2001-05-20', gender: 'Nữ', email: 'bich.tt@example.com', phone: '0912345678', className: 'K65-KTPM', department: 'Công nghệ thông tin', gpa: 3.5 },
  { id: 'SV003', fullName: 'Lê Hoàng Cường', dateOfBirth: '1999-08-10', gender: 'Nam', email: 'cuong.lh@example.com', phone: '0923456789', className: 'K64-HTTT', department: 'Công nghệ thông tin', gpa: 3.2 },
  { id: 'SV004', fullName: 'Phạm Mai Dung', dateOfBirth: '2002-12-05', gender: 'Nữ', email: 'dung.pm@example.com', phone: '0934567890', className: 'K66-CNTT', department: 'Công nghệ thông tin', gpa: 3.9 },
  { id: 'SV005', fullName: 'Hoàng Đức Duy', dateOfBirth: '2001-03-25', gender: 'Nam', email: 'duy.hd@example.com', phone: '0945678901', className: 'K65-KTPM', department: 'Công nghệ thông tin', gpa: 3.1 },
  { id: 'SV006', fullName: 'Vũ Thị Hoa', dateOfBirth: '2000-07-30', gender: 'Nữ', email: 'hoa.vt@example.com', phone: '0956789012', className: 'K65-CNTT', department: 'Công nghệ thông tin', gpa: 3.6 },
  { id: 'SV007', fullName: 'Đặng Đình Kiên', dateOfBirth: '1999-11-12', gender: 'Nam', email: 'kien.dd@example.com', phone: '0967890123', className: 'K64-HTTT', department: 'Công nghệ thông tin', gpa: 2.8 },
  { id: 'SV008', fullName: 'Bùi Ngọc Lan', dateOfBirth: '2002-02-18', gender: 'Nữ', email: 'lan.bn@example.com', phone: '0978901234', className: 'K66-KTPM', department: 'Công nghệ thông tin', gpa: 3.7 },
  { id: 'SV009', fullName: 'Ngô Trí Minh', dateOfBirth: '2001-09-08', gender: 'Nam', email: 'minh.nt@example.com', phone: '0989012345', className: 'K65-CNTT', department: 'Công nghệ thông tin', gpa: 3.4 },
  { id: 'SV010', fullName: 'Đỗ Hà Vy', dateOfBirth: '2000-04-22', gender: 'Nữ', email: 'vy.dh@example.com', phone: '0990123456', className: 'K65-HTTT', department: 'Công nghệ thông tin', gpa: 3.3 },
];