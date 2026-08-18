import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppHeader, AppEmptyState } from '../../components/ui';
import { colors } from '../../theme';
import { ClipboardList } from 'lucide-react-native';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="My Orders" />
      <View style={styles.content}>
        <AppEmptyState 
          title="No Orders Yet" 
          description="Looks like you haven't placed any orders. Start browsing the market to find fresh products!"
          icon={<ClipboardList size={48} color={colors.brand.muted} strokeWidth={1.5} />}
          actionTitle="Browse Market"
          onAction={() => {}}
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
