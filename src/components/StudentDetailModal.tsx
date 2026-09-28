import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Student } from '../types/student';

interface StudentDetailModalProps {
  visible: boolean;
  student: Student | null;
  onClose: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ visible, student, onClose }) => {
  if (!student) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chi tiết Sinh viên</Text>
          </View>
          
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.label}>Họ và tên:</Text>
              <Text style={styles.value}>{student.fullName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mã SV:</Text>
              <Text style={styles.value}>{student.id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ngày sinh:</Text>
              <Text style={styles.value}>{student.dateOfBirth}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Giới tính:</Text>
              <Text style={styles.value}>{student.gender}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Lớp:</Text>
              <Text style={styles.value}>{student.className}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Khoa:</Text>
              <Text style={styles.value}>{student.department}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>GPA:</Text>
              <Text style={styles.value}>{student.gpa}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{student.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Số điện thoại:</Text>
              <Text style={styles.value}>{student.phone}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    backgroundColor: '#007BFF',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 4,
  },
  label: {
    width: 110,
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StudentDetailModal;
