import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { registerRootComponent } from 'expo';
import { Ionicons } from '@expo/vector-icons';

import { Vault } from './src/components/Vault';
import { ExpenseForm } from './src/components/ExpenseForm';
import { Dashboard } from './src/components/Dashboard';
import { Settings } from './src/components/Settings';
import { Toast } from './src/components/Toast';
import { useToast } from './src/hooks/useToast';
import { useTheme } from './src/hooks/useTheme';
import { ThemeProvider } from './src/context/ThemeContext';
import { Transaction, UserProfile } from './src/types';
import { INITIAL_BALANCE } from './src/constants';

const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  // --- State Management ---
  const [vaultTotal, setVaultTotal] = useState<number>(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    isDriveLinked: false
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { theme, themeColor, darkMode, isLoaded, setThemeColor } = useTheme();
  const { toast, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');

  // --- Load Data on App Start ---
  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      const [savedVault, savedTransactions, savedProfile] =
        await Promise.all([
          AsyncStorage.getItem('spendwise_vault'),
          AsyncStorage.getItem('spendwise_transactions'),
          AsyncStorage.getItem('spendwise_profile'),
        ]);

      if (savedVault) setVaultTotal(parseFloat(savedVault));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    } catch (error) {
      showToast('Failed to load app data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear all app data (for testing/reset)
  const clearAppData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('spendwise_vault'),
        AsyncStorage.removeItem('spendwise_transactions'),
        AsyncStorage.removeItem('spendwise_profile'),
      ]);
      setVaultTotal(INITIAL_BALANCE);
      setTransactions([]);
      setUserProfile({ name: 'User', isDriveLinked: false });
      showToast('App data cleared', 'success');
    } catch (error) {
      showToast('Failed to clear app data', 'error');
    }
  };

  // Function to reset monthly data (keep profile, clear transactions and reset vault)
  const resetMonthlyData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('spendwise_vault'),
        AsyncStorage.removeItem('spendwise_transactions'),
      ]);
      setVaultTotal(INITIAL_BALANCE);
      setTransactions([]);
      showToast('Monthly data reset successfully', 'success');
    } catch (error) {
      showToast('Failed to reset monthly data', 'error');
    }
  };

  // --- Persistence Effects ---
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('spendwise_vault', vaultTotal.toString());
    }
  }, [vaultTotal, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('spendwise_transactions', JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('spendwise_profile', JSON.stringify(userProfile));
    }
  }, [userProfile, isLoading]);

  // --- Actions ---
  const handleUpdateVault = (newTotal: number) => {
    try {
      if (isNaN(newTotal) || newTotal < 0) {
        showToast('Invalid vault amount', 'error');
        return;
      }
      setVaultTotal(newTotal);
      showToast('Vault updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update vault', 'error');
    }
  };

  const handleLogExpense = (data: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction: Transaction = {
        id: generateId(),
        ...data
      };
      setTransactions(prev => [newTransaction, ...prev]);
      setVaultTotal(prev => prev - data.amount);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast('Expense logged successfully', 'success');
    } catch (error) {
      showToast('Failed to log expense', 'error');
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        setVaultTotal(prev => prev + transaction.amount); // Add back the amount
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        showToast('Transaction deleted', 'success');
      }
    } catch (error) {
      showToast('Failed to delete transaction', 'error');
    }
  };

  const handleEditTransaction = (transactionId: string, updatedData: Omit<Transaction, 'id'>) => {
    try {
      const oldTransaction = transactions.find(t => t.id === transactionId);
      if (oldTransaction) {
        // Update the transaction
        setTransactions(prev => prev.map(t => 
          t.id === transactionId 
            ? { ...t, ...updatedData }
            : t
        ));
        
        // Adjust vault total based on amount difference
        const amountDifference = updatedData.amount - oldTransaction.amount;
        setVaultTotal(prev => prev - amountDifference);
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        showToast('Transaction updated successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to update transaction', 'error');
    }
  };

  const handleImport = (data: any) => {
    try {
      if (data.vaultTotal !== undefined) setVaultTotal(data.vaultTotal);
      if (data.transactions) setTransactions(data.transactions);
      if (data.userProfile) setUserProfile(data.userProfile);
      if (data.themeColor) setThemeColor(data.themeColor);
      showToast('Data imported successfully', 'success');
    } catch (error) {
      showToast('Failed to import data', 'error');
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>SpendWise</Text>
        <Text style={[styles.loadingSubtitle, { color: theme.colors.textSecondary }]}>
          Smart Expense Tracking
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        animated={true}
      />

      {/* Sticky Header */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 10,
        backgroundColor: theme.colors.background 
      }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.appIcon, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.appIconText}>S</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.appTitle, { color: theme.colors.text }]}>SpendWise</Text>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              Hello, {userProfile.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.card }]}
          onPress={() => setIsSettingsOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {
          paddingBottom: insets.bottom + 20,
          paddingTop: 20, // Add padding for sticky header
          minHeight: screenHeight - insets.top - insets.bottom
        }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >

        {/* Core Components */}
        <View style={styles.content}>
          <Vault
            total={vaultTotal}
            onUpdateTotal={handleUpdateVault}
            transactions={transactions}
          />

          <ExpenseForm
            onLogExpense={handleLogExpense}
          />

          <Dashboard
            transactions={transactions}
            currentVault={vaultTotal}
            userProfile={userProfile}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTransaction}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            © {new Date().getFullYear()} SpendWise. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        data={{ vaultTotal, transactions, userProfile, themeColor }}
        onImport={handleImport}
        onResetMonthly={resetMonthlyData}
        onClearAll={clearAppData}
      />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerText: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 12,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    gap: 28,
    marginTop: 100, // Account for sticky header height
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 10,
  },
});

// Wrap the app with SafeAreaProvider
const AppWithSafeArea: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};


registerRootComponent(AppWithSafeArea);