import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { AppText, AppButton, AppCard } from '../ui';
import { colors, spacing, radii } from '../../theme';
import type { Category } from '../../api/products';
import { X, Check, ArrowDownUp, Filter as FilterIcon, Sparkles } from 'lucide-react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  organicOnly: boolean;
  onToggleOrganic: (val: boolean) => void;
  sortBy: string;
  onSelectSort: (val: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  organicOnly,
  onToggleOrganic,
  sortBy,
  onSelectSort,
  onClearFilters,
  activeFilterCount,
}) => {
  const sortOptions = [
    { label: 'Newest First', value: '-created_at' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FilterIcon size={20} color={colors.brand.primary} style={{ marginRight: 8 }} />
              <AppText variant="subheading" weight="bold">Filter & Sort</AppText>
              {activeFilterCount > 0 && (
                <View style={styles.countBadge}>
                  <AppText variant="small" weight="bold" color={colors.text.inverse}>
                    {activeFilterCount}
                  </AppText>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Sort Options */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ArrowDownUp size={16} color={colors.text.secondary} style={{ marginRight: 6 }} />
                <AppText variant="small" weight="bold" color={colors.text.secondary} style={styles.sectionTitle}>
                  SORT BY
                </AppText>
              </View>
              <View style={styles.sortList}>
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.sortItem, isSelected && styles.sortItemActive]}
                      onPress={() => onSelectSort(opt.value)}
                      activeOpacity={0.7}
                    >
                      <AppText weight={isSelected ? 'bold' : 'normal'} color={isSelected ? colors.brand.primary : colors.text.primary}>
                        {opt.label}
                      </AppText>
                      {isSelected && <Check size={18} color={colors.brand.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quality Filter */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sparkles size={16} color={colors.text.secondary} style={{ marginRight: 6 }} />
                <AppText variant="small" weight="bold" color={colors.text.secondary} style={styles.sectionTitle}>
                  QUALITY & STANDARDS
                </AppText>
              </View>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <AppText weight="bold">Organic Only</AppText>
                  <AppText variant="small" color={colors.text.secondary}>
                    Show certified chemical-free produce
                  </AppText>
                </View>
                <Switch
                  value={organicOnly}
                  onValueChange={onToggleOrganic}
                  trackColor={{ false: colors.border.strong, true: colors.brand.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Category Filter */}
            <View style={styles.section}>
              <AppText variant="small" weight="bold" color={colors.text.secondary} style={styles.sectionTitle}>
                CATEGORIES
              </AppText>
              <View style={styles.categoryWrap}>
                <TouchableOpacity
                  style={[styles.catChip, !selectedCategory && styles.catChipActive]}
                  onPress={() => onSelectCategory('')}
                  activeOpacity={0.7}
                >
                  <AppText weight={!selectedCategory ? 'bold' : 'normal'} color={!selectedCategory ? colors.brand.primary : colors.text.primary}>
                    All Categories
                  </AppText>
                </TouchableOpacity>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catChip, isSelected && styles.catChipActive]}
                      onPress={() => onSelectCategory(isSelected ? '' : cat.slug)}
                      activeOpacity={0.7}
                    >
                      <AppText weight={isSelected ? 'bold' : 'normal'} color={isSelected ? colors.brand.primary : colors.text.primary}>
                        {cat.name}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {activeFilterCount > 0 && (
              <AppButton
                title="Reset"
                variant="outline"
                size="md"
                onPress={onClearFilters}
                style={{ flex: 1, marginRight: spacing.md }}
              />
            )}
            <AppButton
              title="Apply Filters"
              variant="primary"
              size="md"
              onPress={onClose}
              style={{ flex: activeFilterCount > 0 ? 2 : 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  countBadge: {
    backgroundColor: colors.brand.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeBtn: {
    padding: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.background.elevated,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  section: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    letterSpacing: 0.5,
  },
  sortList: {
    gap: spacing.sm,
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
  },
  sortItemActive: {
    backgroundColor: colors.brand.muted,
    borderColor: colors.brand.primary,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  catChipActive: {
    backgroundColor: colors.brand.muted,
    borderColor: colors.brand.primary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
});
