import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../hooks/useTheme';
import { Transaction, TimeView, Category, UserProfile } from '../types';
import { CATEGORY_COLORS, formatCurrency } from '../constants';
import { PieChart } from './PieChart';
import { EditTransactionModal } from './EditTransactionModal';
import { ThemedAlert } from './ThemedAlert';

interface DashboardProps {
  transactions: Transaction[];
  currentVault: number;
  userProfile: UserProfile;
  onDeleteTransaction?: (transactionId: string) => void;
  onEditTransaction?: (transactionId: string, updatedData: Omit<Transaction, 'id'>) => void;
}



export const Dashboard: React.FC<DashboardProps> = ({ transactions, userProfile, onDeleteTransaction, onEditTransaction }) => {
  const [view, setView] = useState<TimeView>('daily');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const { theme } = useTheme();

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekTime = startOfWeek.getTime();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter(t => {
      if (view === 'daily') return t.timestamp >= startOfDay;
      if (view === 'weekly') return t.timestamp >= startOfWeekTime;
      if (view === 'monthly') return t.timestamp >= startOfMonth;
      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, view]);

  const totalSpent = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    // Use reduce for better performance
    const map = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by amount descending for better UX
    return Object.entries(map)
      .map(([key, value]) => ({
        name: key,
        population: value,
        color: CATEGORY_COLORS[key as Category] || '#9CA3AF',
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      }))
      .sort((a, b) => b.population - a.population);
  }, [filteredTransactions, theme.colors.text]);

  const renderTabButton = (tabView: TimeView, label: string) => (
    <TouchableOpacity
      key={tabView}
      style={[
        styles.tabButton,
        {
          backgroundColor: view === tabView ? theme.colors.primary : 'transparent',
          borderBottomColor: view === tabView ? theme.colors.primary : 'transparent',
        }
      ]}
      onPress={() => setView(tabView)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.tabText,
          {
            color: view === tabView ? 'white' : theme.colors.textSecondary,
            fontWeight: view === tabView ? '600' : '500',
          }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const confirmDeleteTransaction = () => {
    if (transactionToDelete && onDeleteTransaction) {
      onDeleteTransaction(transactionToDelete.id);
    }
    setTransactionToDelete(null);
  };

  const renderTransactionItem = (transaction: Transaction) => (
    <View key={transaction.id} style={[styles.transactionItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: CATEGORY_COLORS[transaction.category as Category] || '#9CA3AF' }
          ]}
        >
          <Text style={styles.categoryIconText}>
            {transaction.category.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionPlace, { color: theme.colors.text }]}>
            {transaction.place}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionTime, { color: theme.colors.textSecondary }]}>
              {new Date(transaction.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            <Text style={[styles.transactionCategory, { color: theme.colors.textSecondary }]}>
              • {transaction.category}
            </Text>
          </View>
          {transaction.note && (
            <Text style={[styles.transactionNote, { color: theme.colors.textSecondary }]}>
              {transaction.note}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: theme.colors.text }]}>
          -{formatCurrency(transaction.amount)}
        </Text>
        <View style={styles.actionButtons}>
          {onEditTransaction && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditingTransaction(transaction)}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          {onDeleteTransaction && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                setTransactionToDelete(transaction);
                setShowDeleteAlert(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
        {renderTabButton('daily', 'Daily')}
        {renderTabButton('weekly', 'Weekly')}
        {renderTabButton('monthly', 'Monthly')}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={false}
      >
        {/* Summary */}
        <View style={styles.summary}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            SPENT {view.toUpperCase()}
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>

        {/* Daily View - Transaction List */}
        {view === 'daily' && (
          <View style={styles.section}>
            {filteredTransactions.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
                <Ionicons
                  name="calendar-outline"
                  size={32}
                  color={theme.colors.textSecondary}
                />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No transactions today.
                </Text>
              </View>
            ) : (
              <View style={styles.transactionContainer}>
                {filteredTransactions.map(renderTransactionItem)}
              </View>
            )}
          </View>
        )}

        {/* Weekly/Monthly View - Charts and Categories */}
        {(view === 'weekly' || view === 'monthly') && (
          <View style={styles.section}>
            {categoryData.length > 0 ? (
              <>
                <View style={styles.chartContainer}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Category Breakdown
                  </Text>
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <PieChart
                      data={categoryData}
                      width={220}
                      height={220}
                      innerRadius={60}
                      timeView={view}
                      totalDays={view === 'weekly' || view === 'monthly' ? (view === 'weekly' ? 7 : 30) : 1}
                      monthlyBudget={view === 'monthly' ? userProfile.monthlyBudget : undefined}
                    />
                  </View>
                </View>

                <View style={styles.categoryList}>
                  <View style={styles.categoryListHeader}>
                    <Ionicons
                      name="list-outline"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      Top Categories
                    </Text>
                  </View>
                  {categoryData.slice(0, 3)
                    .map((category, index) => (
                      <View key={category.name} style={styles.categoryItem}>
                        <View style={styles.categoryLeft}>
                          <Text style={[styles.categoryRank, { color: theme.colors.textSecondary }]}>
                            {index + 1}.
                          </Text>
                          <View
                            style={[styles.categoryDot, { backgroundColor: category.color || '#9CA3AF' }]}
                          />
                          <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                            {category.name}
                          </Text>
                        </View>
                        <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                          {formatCurrency(category.population)}
                        </Text>
                      </View>
                    ))}

                </View>
              </>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
                <Ionicons
                  name="bar-chart-outline"
                  size={32}
                  color={theme.colors.textSecondary}
                />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No data for this period.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isVisible={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={(transactionId, updatedData) => {
          if (onEditTransaction) {
            onEditTransaction(transactionId, updatedData);
          }
          setEditingTransaction(null);
        }}
      />

      {/* Delete Transaction Alert */}
      <ThemedAlert
        visible={showDeleteAlert}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction${transactionToDelete ? ` at ${transactionToDelete.place}` : ''}? This action cannot be undone.`}
        icon="trash-outline"
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: confirmDeleteTransaction,
          },
        ]}
        onClose={() => {
          setShowDeleteAlert(false);
          setTransactionToDelete(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  content: {
    maxHeight: 500,
  },
  summary: {
    padding: 16,
    paddingBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  transactionContainer: {
    minHeight: 80,
  },
  transactionList: {
    gap: 0,
  },

  transactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 52,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionPlace: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  transactionTime: {
    fontSize: 12,
  },
  transactionCategory: {
    fontSize: 12,
    marginLeft: 4,
  },
  transactionNote: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  categoryList: {
    gap: 10,
  },
  categoryListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryRank: {
    fontSize: 12,
    fontWeight: '600',
    width: 20,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // Allow text to shrink properly
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});