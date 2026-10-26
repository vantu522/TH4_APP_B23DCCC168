import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  BookOpen,
  Calendar,
  ClipboardList,
  User,
} from 'lucide-react-native';
import HomeStack from './HomeStack';
import CourseStack from './CourseStack';
import ScheduleStack from './ScheduleStack';
import AssignmentStack from './AssignmentStack';
import ProfileStack from './ProfileStack';
import { ROUTES } from './routes';
import { RootTabParamList } from '../types/navigation';
import { useAppStore } from '../store/useAppStore';
import useNetworkStatus from '../hooks/useNetworkStatus';
import OfflineBanner from '../components/common/OfflineBanner';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  const { initStore, assignments, pendingSyncIds, syncPendingActions } = useAppStore();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    initStore();
  }, [initStore]);

  const uncompletedCount = assignments.filter((a) => a.status === 'todo').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <OfflineBanner
        isOnline={isOnline}
        pendingSyncCount={pendingSyncIds.length}
        onSync={syncPendingActions}
      />

      <Tab.Navigator
        initialRouteName={ROUTES.TAB_HOME}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarStyle: {
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        }}
      >
        <Tab.Screen
          name={ROUTES.TAB_HOME}
          component={HomeStack}
          options={{
            title: 'Tổng quan',
            tabBarIcon: ({ color, size }) => (
              <Home color={color} size={size || 22} />
            ),
          }}
        />
        <Tab.Screen
          name={ROUTES.TAB_COURSE}
          component={CourseStack}
          options={{
            title: 'Môn học',
            tabBarIcon: ({ color, size }) => (
              <BookOpen color={color} size={size || 22} />
            ),
          }}
        />
        <Tab.Screen
          name={ROUTES.TAB_SCHEDULE}
          component={ScheduleStack}
          options={{
            title: 'Thời khóa biểu',
            tabBarIcon: ({ color, size }) => (
              <Calendar color={color} size={size || 22} />
            ),
          }}
        />
        <Tab.Screen
          name={ROUTES.TAB_ASSIGNMENT}
          component={AssignmentStack}
          options={{
            title: 'Bài tập',
            tabBarIcon: ({ color, size }) => (
              <ClipboardList color={color} size={size || 22} />
            ),
            tabBarBadge: uncompletedCount > 0 ? uncompletedCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.danger,
              color: colors.white,
              fontSize: 10,
              fontWeight: 'bold',
            },
          }}
        />
        <Tab.Screen
          name={ROUTES.TAB_PROFILE}
          component={ProfileStack}
          options={{
            title: 'Cá nhân',
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size || 22} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
