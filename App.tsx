import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentManagementScreen from './src/screens/StudentManagementScreen';
import StudentDetailScreen from './src/screens/StudentDetailScreen';
import AddStudentScreen from './src/screens/AddStudentScreen';
import EditStudentScreen from './src/screens/EditStudentScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StudentManagement">
        <Stack.Screen
          name="StudentManagement"
          component={StudentManagementScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StudentDetail"
          component={StudentDetailScreen}
          options={{ title: 'Chi tiết Sinh viên' }}
        />
        <Stack.Screen
          name="AddStudent"
          component={AddStudentScreen}
          options={{ title: 'Thêm Sinh viên mới' }}
        />
        <Stack.Screen
          name="EditStudent"
          component={EditStudentScreen}
          options={{ title: 'Cập nhật Sinh viên' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;