import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, shadows } from '../../theme';

export interface SegmentTab {
  key?: string;
  id?: string;
  label: string;
  count?: number;
}

export interface SegmentedControlProps {
  tabs: SegmentTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: ViewStyle;
}

export function SegmentedControl({
  tabs,
  activeTab,
  onTabChange,
  style
}: SegmentedControlProps) {
  return (
    <View style={[styles.track, style]}>
      {tabs.map((tab) => {
        const tabKey = tab.key || tab.id || tab.label;
        const isActive = tabKey === activeTab;
        return (
          <TouchableOpacity
            key={tabKey}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
            onPress={() => onTabChange(tabKey)}
            activeOpacity={0.8}
          >
            <AppText
              variant="caption"
              weight={isActive ? 'bold' : 'medium'}
              color={isActive ? colors.text.primary : colors.text.muted}
            >
              {tab.label}
            </AppText>
            {tab.count !== undefined && tab.count > 0 && (
              <View 
                style={[
                  styles.countBadge, 
                  { backgroundColor: isActive ? colors.brand.tint : colors.background.elevated }
                ]}
              >
                <AppText 
                  variant="label" 
                  weight="bold" 
                  color={isActive ? colors.brand.primary : colors.text.muted}
                  style={styles.countText}
                >
                  {tab.count}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.background.surface,
    ...shadows.xs,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.pill,
  },
  countText: {
    fontSize: 10,
  }
});
