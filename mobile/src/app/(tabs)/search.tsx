import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppInput, AppEmptyState } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { Search as SearchIcon } from 'lucide-react-native';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AppInput
          placeholder="Search products, crops, farmers..."
          value={query}
          onChangeText={setQuery}
          leftIcon={<SearchIcon size={20} color={colors.text.muted} />}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AppEmptyState 
          title="Search Farmket" 
          description="Find the freshest products, best crops, and local farmers directly from your device."
          icon={<SearchIcon size={48} color={colors.brand.muted} strokeWidth={1.5} />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  searchInput: {
    backgroundColor: colors.background.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
