import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Assignment } from '../../api/types';

export default function AssignmentDetailScreen({ route, navigation }: any) {
  const { id } = route?.params || {};
  const { getAssignmentById, updateAssignmentStatus } = useAppStore();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      if (id) {
        const found = await getAssignmentById(id);
        if (found) {
          setAssignment(found);
          // Đặt tiêu đề header là tên bài tập được chọn
          navigation.setOptions({
            title: found.title,
          });
        }
      }
      setLoading(false);
    };

    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin bài tập</Text>
      </View>
    );
  }

  const isDone = assignment.status === 'done';

  const handleToggleStatus = async () => {
    const nextStatus = isDone ? 'todo' : 'done';
    setAssignment((prev) => (prev ? { ...prev, status: nextStatus } : null));
    await updateAssignmentStatus(assignment.id, nextStatus);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.banner}>
          <Text style={styles.title}>{assignment.title}</Text>
          <Text style={styles.courseText}>
            Môn học: {assignment.course?.name || `Mã #${assignment.courseId}`}
          </Text>
        </View>

        {/* Trạng thái hiện tại */}
        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái:</Text>
          <View
            style={[
              styles.statusBadge,
              isDone ? styles.badgeDone : styles.badgeTodo,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isDone ? styles.textDone : styles.textTodo,
              ]}
            >
              {isDone ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </Text>
          </View>
        </View>

        {/* Hạn nộp */}
        <View style={styles.row}>
          <Text style={styles.label}>Hạn nộp:</Text>
          <Text style={styles.value}>
            {new Date(assignment.dueDate).toLocaleString('vi-VN')}
          </Text>
        </View>

        {/* Mô tả chi tiết */}
        {assignment.description ? (
          <View style={styles.descBox}>
            <Text style={styles.descTitle}>Nội dung yêu cầu:</Text>
            <Text style={styles.descContent}>{assignment.description}</Text>
          </View>
        ) : null}

        {/* Nút đổi trạng thái */}
        <TouchableOpacity
          style={[styles.toggleBtn, isDone ? styles.btnUndo : styles.btnComplete]}
          onPress={handleToggleStatus}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {isDone ? 'Đánh dấu Chưa hoàn thành' : 'Đánh dấu Đã hoàn thành'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  banner: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 6,
  },
  courseText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
  },
  value: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDone: {
    backgroundColor: '#d4edda',
  },
  badgeTodo: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textDone: {
    color: '#155724',
  },
  textTodo: {
    color: '#856404',
  },
  descBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  descTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 6,
  },
  descContent: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 22,
  },
  toggleBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnComplete: {
    backgroundColor: '#28a745',
  },
  btnUndo: {
    backgroundColor: '#6c757d',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
