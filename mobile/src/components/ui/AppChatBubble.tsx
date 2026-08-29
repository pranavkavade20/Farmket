import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radii } from '../../theme';
import type { ChatMessage } from '../../api/chat';
import { Check, CheckCheck } from 'lucide-react-native';

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
      <View style={[
        styles.bubble, 
        { backgroundColor },
        isMe ? styles.bubbleMe : styles.bubbleOther
      ]}>
        <AppText color={textColor} style={styles.messageText}>{message.content}</AppText>
        <View style={styles.footer}>
          <AppText variant="small" style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.text.muted }]}>
            {timeString}
          </AppText>
          {isMe && (
            <View style={{ marginLeft: 4 }}>
              {message.is_read ? (
                <CheckCheck size={14} color="rgba(255,255,255,0.9)" />
              ) : (
                <Check size={14} color="rgba(255,255,255,0.7)" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '85%',
    marginBottom: spacing.sm,
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bubbleMe: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.sm,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  bubbleOther: {
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    borderColor: colors.border.subtle,
  },
  messageText: {
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
  }
});
