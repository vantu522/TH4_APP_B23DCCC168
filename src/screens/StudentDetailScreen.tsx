import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStudentStore } from '../store/useStudentStore';

import { getAcademicRanking } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentDetail'>;

const StudentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  const { deleteStudent } = useStudentStore();

  const handleEdit = () => {
    navigation.navigate('EditStudent', { student });
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa sinh viên ${student.fullName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            deleteStudent(student.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
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
          <Text style={styles.value}>
            {student.gpa} - {getAcademicRanking(student.gpa)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{student.email}</Text>
        </View>
        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <Text style={styles.value}>{student.phone}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    width: 120,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FFC107',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FF4D4F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF4D4F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StudentDetailScreen;
