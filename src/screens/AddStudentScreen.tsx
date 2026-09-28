import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStudentStore } from '../store/useStudentStore';
import { Student, Gender, StudentFormData, StudentFormErrors } from '../types/student';
import { validateStudentForm, GENDER_OPTIONS } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddStudent'>;


const AddStudentScreen: React.FC<Props> = ({ navigation }) => {
  const { students, addStudent } = useStudentStore();
  const existingIds = students.map((s) => s.id.toUpperCase());

  const [form, setForm] = useState<StudentFormData>({
    id: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    className: '',
    department: '',
    gpa: '',
  });

  const [errors, setErrors] = useState<StudentFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateValue(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      handleChange('dateOfBirth', formattedDate);
      
      // Xoá lỗi và set touched khi thay đổi
      setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
      setTouched((prev) => ({ ...prev, dateOfBirth: true }));
    }
  };

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Xoá lỗi ngay khi user gõ
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof StudentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validate field đơn lẻ khi blur
    const fieldErrors = validateStudentForm(form, existingIds);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleSelectGender = (gender: Gender) => {
    handleChange('gender', gender);
    setTouched((prev) => ({ ...prev, gender: true }));
    setErrors((prev) => ({ ...prev, gender: undefined }));
  };

  const handleSubmit = () => {
    const allErrors = validateStudentForm(form, existingIds);
    setErrors(allErrors);
    setTouched({
      id: true, fullName: true, dateOfBirth: true, gender: true,
      email: true, phone: true, className: true, department: true, gpa: true,
    });

    if (Object.keys(allErrors).length > 0) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng kiểm tra và sửa các trường bị lỗi trước khi lưu.');
      return;
    }

    const newStudent: Student = {
      id: form.id.trim().toUpperCase(),
      fullName: form.fullName.trim(),
      dateOfBirth: form.dateOfBirth.trim(),
      gender: form.gender as Gender,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      className: form.className.trim(),
      department: form.department.trim(),
      gpa: parseFloat(parseFloat(form.gpa).toFixed(2)),
    };

    addStudent(newStudent);
    Alert.alert('Thành công', `Đã thêm sinh viên ${newStudent.fullName}!`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleReset = () => {
    setForm({ id: '', fullName: '', dateOfBirth: '', gender: '', email: '', phone: '', className: '', department: '', gpa: '' });
    setErrors({});
    setTouched({});
    setShowGenderDropdown(false);
  };
  const renderInput = (
    label: string,
    field: keyof StudentFormData,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    }
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, touched[field] && errors[field] ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={form[field] as string}
        onChangeText={(v) => handleChange(field, v)}
        onBlur={() => handleBlur(field)}
        keyboardType={options?.keyboardType ?? 'default'}
        autoCapitalize={options?.autoCapitalize ?? 'sentences'}
      />
      {touched[field] && errors[field] ? (
        <Text style={styles.errorText}>⚠ {errors[field]}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

        {renderInput('Mã sinh viên', 'id', 'VD: SV011', { autoCapitalize: 'characters' })}
        {renderInput('Họ và tên', 'fullName', 'VD: Nguyễn Văn A', { autoCapitalize: 'words' })}
        
        {/* Ngày sinh - DatePicker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Ngày sinh <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              touched.dateOfBirth && errors.dateOfBirth ? styles.inputError : null,
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownButtonText, !form.dateOfBirth && styles.placeholderText]}>
              {form.dateOfBirth || 'Chọn ngày sinh'}
            </Text>
            <Text style={styles.dropdownIcon}>📅</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {touched.dateOfBirth && errors.dateOfBirth ? (
            <Text style={styles.errorText}>⚠ {errors.dateOfBirth}</Text>
          ) : null}
        </View>

        {/* Giới tính - Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Giới tính <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              touched.gender && errors.gender ? styles.inputError : null,
              showGenderDropdown && styles.dropdownButtonActive,
            ]}
            onPress={() => setShowGenderDropdown(!showGenderDropdown)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownButtonText, !form.gender && styles.placeholderText]}>
              {form.gender || 'Chọn giới tính'}
            </Text>
            <Text style={styles.dropdownIcon}>{showGenderDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showGenderDropdown && (
            <View style={styles.dropdownMenu}>
              {GENDER_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.dropdownItem, form.gender === g && styles.dropdownItemSelected]}
                  onPress={() => {
                    handleSelectGender(g);
                    setShowGenderDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, form.gender === g && styles.dropdownItemTextSelected]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {touched.gender && errors.gender ? (
            <Text style={styles.errorText}>⚠ {errors.gender}</Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Liên hệ</Text>
        {renderInput('Email', 'email', 'VD: example@email.com', {
          keyboardType: 'email-address',
          autoCapitalize: 'none',
        })}
        {renderInput('Số điện thoại', 'phone', 'VD: 0901234567', { keyboardType: 'phone-pad' })}

        <Text style={styles.sectionTitle}>Học vụ</Text>
        {renderInput('Lớp', 'className', 'VD: K65-CNTT')}
        {renderInput('Khoa', 'department', 'VD: Công nghệ thông tin')}
        {renderInput('GPA', 'gpa', 'VD: 3.5 (từ 0.0 đến 4.0)', { keyboardType: 'numeric' })}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.8}>
            <Text style={styles.resetButtonText}>Nhập lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>Lưu sinh viên</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212529',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#212529',
    paddingLeft: 8,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#DC3545',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#dde3ea',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: '#222',
  },
  inputError: {
    borderColor: '#DC3545',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  // Giới tính - Dropdown
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#dde3ea',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },
  dropdownButtonActive: {
    borderColor: '#212529',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#222',
  },
  placeholderText: {
    color: '#aaa',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#555',
  },
  dropdownMenu: {
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#dde3ea',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  dropdownItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
    color: '#212529',
  },
  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#212529',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#212529',
    fontWeight: '700',
    fontSize: 15,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default AddStudentScreen;
