import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Session } from '../../api/types';

export default function SessionDetailScreen({ route, navigation }: any) {
  const { id } = route?.params || {};
  const { getSessionById } = useAppStore();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      if (id) {
        const found = await getSessionById(id);
        if (found) {
          setSession(found);
          // Quy tắc 2: Đặt tiêu đề header là tên môn học của buổi học
          navigation.setOptions({
            title: found.course?.name || `Buổi học #${found.id}`,
          });
        }
      }
      setLoading(false);
    };

    loadSession();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin buổi học</Text>
      </View>
    );
  }

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
      <View style={styles.card}>
        <View style={styles.banner}>
          <Text style={styles.courseName}>
            {session.course?.name || 'Thông tin môn học'}
          </Text>
          {session.course?.code && (
            <Text style={styles.courseCode}>Mã môn: {session.course.code}</Text>
          )}
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Thứ trong tuần</Text>
          <Text style={styles.value}>{getDayName(session.dayOfWeek)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Thời gian học</Text>
          <Text style={styles.valueHighlight}>
            {session.startTime} - {session.endTime}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Phòng học</Text>
          <Text style={styles.value}>{session.room}</Text>
        </View>

        {session.course?.lecturer && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Giảng viên phụ trách</Text>
            <Text style={styles.value}>{session.course.lecturer}</Text>
          </View>
        )}

        {session.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Ghi chú buổi học:</Text>
            <Text style={styles.noteText}>{session.note}</Text>
          </View>
        ) : null}
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
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  courseCode: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
    marginTop: 4,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  label: {
    fontSize: 12,
    color: '#868e96',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 3,
  },
  value: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  valueHighlight: {
    fontSize: 17,
    color: '#007bff',
    fontWeight: '700',
  },
  noteBox: {
    marginTop: 14,
    backgroundColor: '#fff9db',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#fcc419',
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f59f00',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});
