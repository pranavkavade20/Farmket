import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radii } from '../../theme';
import type { ChatMessage } from '../../api/chat';

interface AppChatBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export const AppChatBubble: React.FC<AppChatBubbleProps> = ({ message, isMe }) => {
  const alignSelf = isMe ? 'flex-end' : 'flex-start';
  const backgroundColor = isMe ? colors.brand.primary : colors.background.surface;
  const textColor = isMe ? colors.text.inverse : colors.text.primary;
  
  const timeString = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.container, { alignSelf }]}>
      <View style={[styles.bubble, { backgroundColor }]}>
        <AppText color={textColor}>{message.content}</AppText>
      </View>
      <AppText variant="small" color={colors.text.muted} style={[styles.time, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>
        {timeString} {isMe && (message.is_read ? '✓✓' : '✓')}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginBottom: spacing.md,
  },
  bubble: {
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  time: {
    marginTop: spacing.xs,
    fontSize: 10,
  }
});
