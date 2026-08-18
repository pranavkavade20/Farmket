import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppHeader, AppText } from '../../components/ui';
import { colors } from '../../theme';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Messages" />
      <View style={styles.content}>
        <AppText color={colors.text.secondary}>No messages yet.</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
