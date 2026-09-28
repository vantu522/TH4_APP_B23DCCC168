import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Student } from '../types/student';

interface StudentCardProps {
  student: Student;
  onView?: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onView }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => onView && onView(student)}>
      <Text style={styles.name}>{student.fullName}</Text>
      <Text>Mã SV: {student.id}</Text>
      <Text>Lớp: {student.className} - Khoa: {student.department}</Text>
      <Text>GPA: {student.gpa}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },

});

export default StudentCard;
