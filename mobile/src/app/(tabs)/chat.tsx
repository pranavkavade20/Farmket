import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppHeader, AppEmptyState } from '../../components/ui';
import { colors } from '../../theme';
import { MessageSquare } from 'lucide-react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Messages" />
      <View style={styles.content}>
        <AppEmptyState 
          title="No Messages" 
          description="When you contact farmers or buyers, your conversations will appear here."
          icon={<MessageSquare size={48} color={colors.brand.muted} strokeWidth={1.5} />}
        />
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
