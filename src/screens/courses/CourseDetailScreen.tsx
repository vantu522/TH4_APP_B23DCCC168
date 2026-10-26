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
import { Course, Session, Assignment } from '../../api/types';

export default function CourseDetailScreen({ route, navigation }: any) {
  const { id } = route?.params || {};
  const { getCourseById, sessions, assignments, fetchSessions, fetchAssignments } =
    useAppStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      if (id) {
        const found = await getCourseById(id);
        if (found) {
          setCourse(found);
          // Quy tắc 2: Tiêu đề header là tên mục được chọn
          navigation.setOptions({
            title: found.name,
          });
        }
      }
      await Promise.all([fetchSessions(), fetchAssignments()]);
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

  if (!course) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin môn học</Text>
      </View>
    );
  }

  // Lọc lịch học và bài tập của môn học này
  const courseSessions = sessions.filter((s) => s.courseId === course.id);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);

  const getDayName = (dayIndex: number) => {
    const map: Record<number, string> = {
      2: 'Thứ 2',
      3: 'Thứ 3',
      4: 'Thứ 4',
      5: 'Thứ 5',
      6: 'Thứ 6',
      7: 'Thứ 7',
      8: 'Chủ nhật',
    };
    return map[dayIndex] || `Thứ ${dayIndex}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Thẻ thông tin môn học */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.code}</Text>
          </View>
          <Text style={styles.credits}>{course.credits} tín chỉ</Text>
        </View>

        <Text style={styles.courseName}>{course.name}</Text>
        <Text style={styles.infoRow}>
          <Text style={styles.bold}>Giảng viên:</Text> {course.lecturer}
        </Text>
        {course.semester && (
          <Text style={styles.infoRow}>
            <Text style={styles.bold}>Học kỳ:</Text> {course.semester}
          </Text>
        )}
        {course.description && (
          <View style={styles.descBox}>
            <Text style={styles.descTitle}>Mô tả môn học:</Text>
            <Text style={styles.descText}>{course.description}</Text>
          </View>
        )}
      </View>

      {/* Lịch học của môn */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch học ({courseSessions.length})</Text>
        {courseSessions.length === 0 ? (
          <Text style={styles.subEmpty}>Chưa có lịch học cho môn này</Text>
        ) : (
          courseSessions.map((session) => (
            <View key={session.id} style={styles.subCard}>
              <Text style={styles.subCardTitle}>
                {getDayName(session.dayOfWeek)}: {session.startTime} - {session.endTime}
              </Text>
              <Text style={styles.subCardInfo}>Phòng học: {session.room}</Text>
              {session.note ? (
                <Text style={styles.noteText}>Ghi chú: {session.note}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      {/* Bài tập của môn */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Bài tập ({courseAssignments.length})
        </Text>
        {courseAssignments.length === 0 ? (
          <Text style={styles.subEmpty}>Không có bài tập nào cho môn này</Text>
        ) : (
          courseAssignments.map((assignment) => (
            <View key={assignment.id} style={styles.subCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.subCardTitle}>{assignment.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    assignment.status === 'done' ? styles.statusDone : styles.statusTodo,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {assignment.status === 'done' ? 'Đã xong' : 'Chưa xong'}
                  </Text>
                </View>
              </View>
              <Text style={styles.subCardInfo}>
                Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
              </Text>
              {assignment.description && (
                <Text style={styles.noteText}>{assignment.description}</Text>
              )}
            </View>
          ))
        )}
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#e7f5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  credits: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  infoRow: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 6,
  },
  bold: {
    fontWeight: '600',
  },
  descBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  descTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  descText: {
    fontSize: 14,
    color: '#343a40',
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 10,
  },
  subEmpty: {
    fontSize: 13,
    color: '#868e96',
    fontStyle: 'italic',
    paddingLeft: 4,
  },
  subCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  subCardInfo: {
    fontSize: 13,
    color: '#495057',
    marginTop: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusDone: {
    backgroundColor: '#d4edda',
  },
  statusTodo: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
