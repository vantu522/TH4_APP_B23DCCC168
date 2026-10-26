import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import FormInput from '../../components/common/FormInput';
import AppButton from '../../components/common/AppButton';
import { validateStudentProfile } from '../../utils/validators';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function EditProfileScreen({ navigation }: any) {
  const { student, updateStudent, isOnline } = useAppStore();

  const [fullName, setFullName] = useState(student?.fullName || '');
  const [className, setClassName] = useState(student?.className || '');
  const [major, setMajor] = useState(student?.major || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const err = validateStudentProfile(fullName, email, phone);
    if (err) {
      setError(err);
      Alert.alert('Lỗi nhập liệu', err);
      return;
    }

    setSaving(true);
    const success = await updateStudent({
      fullName: fullName.trim(),
      className: className.trim(),
      major: major.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setSaving(false);

    if (success) {
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân lên máy chủ!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } else {
      // Khi offline: lưu vào hàng đợi outbox
      Alert.alert(
        'Đã lưu ngoại tuyến',
        'Hiện đang offline. Thông tin cá nhân đã được lưu vào hàng đợi và sẽ tự động đồng bộ khi có mạng trở lại.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <FormInput
          label="Họ và tên"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            setError(null);
          }}
          placeholder="Nhập họ và tên..."
          required
        />

        <FormInput
          label="Lớp sinh hoạt"
          value={className}
          onChangeText={setClassName}
          placeholder="Ví dụ: K65-CNTT..."
        />

        <FormInput
          label="Chuyên ngành"
          value={major}
          onChangeText={setMajor}
          placeholder="Ví dụ: Công nghệ thông tin..."
        />

        <FormInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          placeholder="example@student.edu.vn"
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />

        <FormInput
          label="Số điện thoại"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setError(null);
          }}
          placeholder="0901234567"
          keyboardType="phone-pad"
        />

        <AppButton
          title="Lưu thay đổi"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
