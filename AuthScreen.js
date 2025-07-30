import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginScreen, SignupScreen } from './AuthScreens';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginScreen onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <SignupScreen onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});