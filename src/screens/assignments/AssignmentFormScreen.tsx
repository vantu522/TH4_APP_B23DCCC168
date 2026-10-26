import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import FormInput from '../../components/common/FormInput';
import AppButton from '../../components/common/AppButton';
import { validateAssignment } from '../../utils/validators';
import { formatDate } from '../../utils/date';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function AssignmentFormScreen({ navigation }: any) {
  const { courses, createAssignment } = useAppStore();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '1');
  const [description, setDescription] = useState('');

  // Mặc định hạn nộp là 7 ngày sau (định dạng YYYY-MM-DD)
  const defaultFutureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [dueDateString, setDueDateString] = useState(defaultFutureDate);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Danh sách các mốc chọn nhanh hạn nộp
  const quickDatePresets = [
    { label: 'Hôm nay', days: 0 },
    { label: '+1 ngày', days: 1 },
    { label: '+3 ngày', days: 3 },
    { label: '+7 ngày (1 tuần)', days: 7 },
    { label: '+14 ngày (2 tuần)', days: 14 },
  ];

  const handleSelectPreset = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setDueDateString(d.toISOString().split('T')[0]);
    setError(null);
  };

  const handleSubmit = async () => {
    // Ghép ngày với giờ cuối ngày (23:59:59)
    const isoDueDate = new Date(`${dueDateString}T23:59:59.000Z`).toISOString();

    // A5: Kiểm tra dữ liệu đầu vào: tiêu đề không rỗng, hạn nộp không ở quá khứ
    const err = validateAssignment(title, courseId, isoDueDate);
    if (err) {
      setError(err);
      Alert.alert('Lỗi nhập liệu', err);
      return;
    }

    setSubmitting(true);
    try {
      const ok = await createAssignment({
        courseId,
        title: title.trim(),
        description: description.trim(),
        dueDate: isoDueDate,
        status: 'todo',
      });

      setSubmitting(false);

      if (ok) {
        Alert.alert('Thành công', 'Đã lưu bài tập mới lên máy chủ!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        // Đã lưu vào hàng đợi outbox offline
        Alert.alert(
          'Đã lưu ngoại tuyến',
          'Hiện đang offline. Bài tập đã được lưu vào hàng đợi và sẽ tự động gửi lên máy chủ khi có mạng trở lại.',
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
    } catch (submitErr) {
      setSubmitting(false);
      Alert.alert('Lỗi', 'Không thể tạo bài tập. Vui lòng thử lại.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Tiêu đề bài tập */}
        <FormInput
          label="Tiêu đề bài tập"
          placeholder="Ví dụ: Thiết kế cơ sở dữ liệu bán hàng..."
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setError(null);
          }}
          required
          error={error?.includes('tiêu đề') ? error : undefined}
        />

        {/* Chọn Môn học */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Chọn môn học <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {courses.map((course) => {
              const isSelected = course.id === courseId;
              return (
                <TouchableOpacity
                  key={course.id}
                  style={[styles.chip, isSelected && styles.selectedChip]}
                  onPress={() => setCourseId(course.id)}
                >
                  <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                    {course.code} - {course.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Hạn nộp (Kiểm tra không ở quá khứ) */}
        <FormInput
          label="Hạn nộp (Định dạng YYYY-MM-DD)"
          placeholder="2026-11-05"
          value={dueDateString}
          onChangeText={(text) => {
            setDueDateString(text);
            setError(null);
          }}
          required
          error={error?.includes('hạn nộp') || error?.includes('quá khứ') ? error : undefined}
        />

        {/* Phím tắt chọn nhanh hạn nộp */}
        <View style={styles.presetContainer}>
          <Text style={styles.presetLabel}>Chọn nhanh mốc hạn nộp:</Text>
          <View style={styles.presetRow}>
            {quickDatePresets.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetBtn}
                onPress={() => handleSelectPreset(preset.days)}
              >
                <Text style={styles.presetBtnText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.helperText}>
          Hạn nộp hiển thị: {formatDate(dueDateString)}
        </Text>

        {/* Mô tả / Yêu cầu */}
        <FormInput
          label="Mô tả / Yêu cầu chi tiết"
          placeholder="Nhập chi tiết yêu cầu nộp bài, định dạng file, lưu ý..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Nút lưu */}
        <AppButton
          title="Lưu bài tập mới"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
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
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  chipRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  selectedChipText: {
    color: colors.white,
    fontWeight: '600',
  },
  presetContainer: {
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  presetLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetBtnText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});
