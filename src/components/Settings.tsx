import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { writeAsStringAsync, readAsStringAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';

import { Transaction, Category } from '../types';

import { useTheme } from '../hooks/useTheme';
import { UserProfile, ThemeColor } from '../types';
import { THEME_COLORS } from '../constants';
import { ThemedAlert } from './ThemedAlert';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  data: any;
  onImport: (data: any) => void;
  onResetMonthly: () => void;
  onClearAll: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  data,
  onImport,
  onResetMonthly,
  onClearAll,
}) => {
  const { theme, darkMode, themeColor, toggleDarkMode, setThemeColor } = useTheme();
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempBudget, setTempBudget] = useState(userProfile.monthlyBudget?.toString() || '');
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [budgetAlertType, setBudgetAlertType] = useState<'edit' | 'invalid'>('edit');
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [showExportAlert, setShowExportAlert] = useState(false);
  const [showImportAlert, setShowImportAlert] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);
  const [exportAlertType, setExportAlertType] = useState<'noData' | 'sharingUnavailable' | 'failed'>('noData');
  const [importAlertData, setImportAlertData] = useState<{
    type: 'invalidFile' | 'warnings' | 'confirm' | 'noData' | 'failed';
    message?: string;
    transactions?: Transaction[];
    errors?: string[];
  }>({ type: 'invalidFile' });


  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateProfile({ ...userProfile, name: tempName.trim() });
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
    }
  };

  const handleSaveBudget = () => {
    const budgetValue = tempBudget.trim() ? parseFloat(tempBudget.trim()) : undefined;
    if (budgetValue === undefined || (!isNaN(budgetValue) && budgetValue >= 0)) {
      onUpdateProfile({ ...userProfile, monthlyBudget: budgetValue });
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
    } else {
      setBudgetAlertType('invalid');
      setShowBudgetAlert(true);
    }
  };

  const handleBudgetFocus = () => {
    setBudgetAlertType('edit');
    setShowBudgetAlert(true);
  };

  const confirmBudgetEdit = () => {
    // Allow the user to proceed with editing
  };

  const handleExportCSV = async () => {
    try {
      if (!data.transactions || data.transactions.length === 0) {
        setExportAlertType('noData');
        setShowExportAlert(true);
        return;
      }

      // Create CSV content
      const headers = ['Date', 'Time', 'Amount', 'Place', 'Category', 'Note'];
      const csvRows = [headers.join(',')];

      data.transactions.forEach((transaction: Transaction) => {
        const date = new Date(transaction.timestamp);
        const dateStr = date.toLocaleDateString('en-IN');
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        // Escape commas and quotes in text fields
        const escapeCSV = (text: string) => {
          if (text.includes(',') || text.includes('"') || text.includes('\n')) {
            return `"${text.replace(/"/g, '""')}"`;
          }
          return text;
        };

        const row = [
          dateStr,
          timeStr,
          transaction.amount.toString(),
          escapeCSV(transaction.place),
          escapeCSV(transaction.category),
          escapeCSV(transaction.note || '')
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const fileName = `spendwise_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${documentDirectory}${fileName}`;
      
      await writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Share SpendWise Transactions CSV',
        });
      } else {
        setExportAlertType('sharingUnavailable');
        setShowExportAlert(true);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('CSV Export error:', error);
      setExportAlertType('failed');
      setShowExportAlert(true);
    }
  };

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileContent = await readAsStringAsync(result.assets[0].uri);
        
        // Parse CSV
        const lines = fileContent.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          setImportAlertData({ type: 'invalidFile' });
          setShowImportAlert(true);
          return;
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const transactions: Transaction[] = [];
        const errors: string[] = [];

        dataLines.forEach((line, index) => {
          try {
            // Simple CSV parsing (handles basic cases)
            const values = line.split(',').map(val => val.trim().replace(/^"|"$/g, ''));
            
            if (values.length < 5) {
              errors.push(`Row ${index + 2}: Insufficient columns`);
              return;
            }

            const [dateStr, timeStr, amountStr, place, category, note = ''] = values;
            
            // Parse date and time
            const dateParts = dateStr.split('/');
            const timeParts = timeStr.split(':');
            
            if (dateParts.length !== 3 || timeParts.length !== 2) {
              errors.push(`Row ${index + 2}: Invalid date/time format`);
              return;
            }

            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
            const year = parseInt(dateParts[2]);
            const hour = parseInt(timeParts[0]);
            const minute = parseInt(timeParts[1]);

            const timestamp = new Date(year, month, day, hour, minute).getTime();
            const amount = parseFloat(amountStr);

            if (isNaN(amount) || amount <= 0) {
              errors.push(`Row ${index + 2}: Invalid amount`);
              return;
            }

            if (!place.trim()) {
              errors.push(`Row ${index + 2}: Place is required`);
              return;
            }

            // Validate category
            const validCategories = Object.values(Category);
            if (!validCategories.includes(category as Category)) {
              errors.push(`Row ${index + 2}: Invalid category "${category}"`);
              return;
            }

            transactions.push({
              id: Math.random().toString(36).substring(2, 9),
              amount,
              place: place.trim(),
              category: category as Category,
              note: note.trim(),
              timestamp,
            });

          } catch (error) {
            errors.push(`Row ${index + 2}: Parse error`);
          }
        });

        if (errors.length > 0) {
          setImportAlertData({
            type: 'warnings',
            message: `${transactions.length} transactions imported successfully.\n\nErrors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}`,
            transactions,
            errors
          });
          setShowImportAlert(true);
        } else if (transactions.length > 0) {
          setImportAlertData({
            type: 'confirm',
            message: `Found ${transactions.length} valid transactions. This will add them to your existing data.`,
            transactions
          });
          setShowImportAlert(true);
        } else {
          setImportAlertData({ type: 'noData' });
          setShowImportAlert(true);
        }
      }
    } catch (error) {
      console.error('CSV Import error:', error);
      setImportAlertData({ type: 'failed' });
      setShowImportAlert(true);
    }
  };

  const handleThemeColorChange = (color: ThemeColor) => {
    setThemeColor(color);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    toggleDarkMode(value);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  const handleResetMonthly = () => {
    setShowResetAlert(true);
  };

  const confirmResetMonthly = () => {
    onResetMonthly();
    onClose();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  const handleClearAll = () => {
    setShowClearAlert(true);
  };

  const confirmClearAll = () => {
    onClearAll();
    onClose();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  const showDataInfoModal = () => {
    setShowInfoAlert(true);
  };

  const confirmImport = () => {
    if (importAlertData.transactions && importAlertData.transactions.length > 0) {
      const newData = { ...data, transactions: [...importAlertData.transactions, ...data.transactions] };
      onImport(newData);
      onClose();
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Sticky Header */}
        <View style={[styles.header, { 
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.background 
        }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                PROFILE
              </Text>
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Name</Text>
              <TextInput
                style={[styles.textInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                value={tempName}
                onChangeText={setTempName}
                onBlur={handleSaveName}
                placeholder="Your Name"
                placeholderTextColor={theme.colors.textSecondary}
              />
              
              <Text style={[styles.inputLabel, { color: theme.colors.text, marginTop: 16 }]}>Monthly Budget (Optional)</Text>
              <TextInput
                style={[styles.textInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                value={tempBudget}
                onChangeText={setTempBudget}
                onBlur={handleSaveBudget}
                onFocus={handleBudgetFocus}
                placeholder="Enter monthly budget"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Theme Color Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                THEME COLOR
              </Text>
            </View>
            <View style={[styles.colorGrid, { backgroundColor: theme.colors.card }]}>
              {Object.entries(THEME_COLORS).map(([key, color]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    themeColor === key && styles.selectedColor,
                  ]}
                  onPress={() => handleThemeColorChange(key as ThemeColor)}
                  activeOpacity={0.8}
                >
                  {themeColor === key && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                  {themeColor !== key && (
                    <View style={styles.unselectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name={darkMode ? "moon-outline" : "sunny-outline"}
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                APPEARANCE
              </Text>
            </View>
            <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={darkMode ? 'white' : theme.colors.textSecondary}
              />
            </View>
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cloud-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                DATA MANAGEMENT
              </Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={showDataInfoModal}
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
              onPress={handleExportCSV}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonLeft}>
                <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
                <View>
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                    Export Data
                  </Text>
                  <Text style={[styles.actionButtonSubtext, { color: theme.colors.textSecondary }]}>
                    Export transactions as CSV file
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
              onPress={handleImportCSV}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonLeft}>
                <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.primary} />
                <View>
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                    Import Data
                  </Text>
                  <Text style={[styles.actionButtonSubtext, { color: theme.colors.textSecondary }]}>
                    Import transactions from CSV file
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Reset Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="refresh-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                RESET DATA
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
              onPress={handleResetMonthly}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonLeft}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.warning} />
                <View>
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                    Reset Monthly Data
                  </Text>
                  <Text style={[styles.actionButtonSubtext, { color: theme.colors.textSecondary }]}>
                    Clear transactions & vault, keep profile
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonLeft}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                <View>
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                    Clear All Data
                  </Text>
                  <Text style={[styles.actionButtonSubtext, { color: theme.colors.textSecondary }]}>
                    Delete everything permanently
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
              SpendWise v1.0.0
            </Text>
          </View>
        </ScrollView>

        {/* Budget Alert */}
        <ThemedAlert
          visible={showBudgetAlert}
          title={budgetAlertType === 'edit' ? "Edit Monthly Budget" : "Invalid Budget Amount"}
          message={
            budgetAlertType === 'edit'
              ? "Are you sure you want to edit your monthly budget? This will affect your spending tracking and progress calculations."
              : "Please enter a valid positive number for your monthly budget, or leave it empty to remove the budget limit."
          }
          icon={budgetAlertType === 'edit' ? "calendar-outline" : "alert-circle-outline"}
          buttons={
            budgetAlertType === 'edit'
              ? [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Edit',
                    style: 'default',
                    onPress: confirmBudgetEdit,
                  },
                ]
              : [
                  {
                    text: 'OK',
                    style: 'default',
                  },
                ]
          }
          onClose={() => setShowBudgetAlert(false)}
        />

        {/* Reset Monthly Alert */}
        <ThemedAlert
          visible={showResetAlert}
          title="Reset Monthly Data"
          message="This will clear all transactions and reset your vault balance. Your profile and settings will be kept. This is useful when starting a new month."
          icon="refresh-outline"
          buttons={[
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: confirmResetMonthly,
            },
          ]}
          onClose={() => setShowResetAlert(false)}
        />

        {/* Clear All Alert */}
        <ThemedAlert
          visible={showClearAlert}
          title="Clear All Data"
          message="This will permanently delete ALL your data including transactions, vault balance, and profile. This cannot be undone."
          icon="trash-outline"
          buttons={[
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete All',
              style: 'destructive',
              onPress: confirmClearAll,
            },
          ]}
          onClose={() => setShowClearAlert(false)}
        />

        {/* Export Alerts */}
        <ThemedAlert
          visible={showExportAlert}
          title={
            exportAlertType === 'noData' ? 'No Data' :
            exportAlertType === 'sharingUnavailable' ? 'Sharing Not Available' :
            'Export Failed'
          }
          message={
            exportAlertType === 'noData' ? 'No transactions to export.' :
            exportAlertType === 'sharingUnavailable' ? 'Sharing is not available on this device.' :
            'Could not export CSV. Please try again.'
          }
          icon={
            exportAlertType === 'noData' ? 'document-outline' :
            exportAlertType === 'sharingUnavailable' ? 'share-outline' :
            'alert-circle-outline'
          }
          buttons={[
            {
              text: 'OK',
              style: 'default',
            },
          ]}
          onClose={() => setShowExportAlert(false)}
        />

        {/* Import Alerts */}
        <ThemedAlert
          visible={showImportAlert}
          title={
            importAlertData.type === 'invalidFile' ? 'Invalid File' :
            importAlertData.type === 'warnings' ? 'Import Warnings' :
            importAlertData.type === 'confirm' ? 'Import CSV' :
            importAlertData.type === 'noData' ? 'No Data' :
            'Import Failed'
          }
          message={
            importAlertData.type === 'invalidFile' ? 'CSV file appears to be empty or invalid.' :
            importAlertData.type === 'warnings' ? importAlertData.message || '' :
            importAlertData.type === 'confirm' ? importAlertData.message || '' :
            importAlertData.type === 'noData' ? 'No valid transactions found in the CSV file.' :
            'Could not read the CSV file. Please try again.'
          }
          icon={
            importAlertData.type === 'invalidFile' ? 'document-outline' :
            importAlertData.type === 'warnings' ? 'warning-outline' :
            importAlertData.type === 'confirm' ? 'cloud-upload-outline' :
            importAlertData.type === 'noData' ? 'document-outline' :
            'alert-circle-outline'
          }
          buttons={
            importAlertData.type === 'warnings' ? [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Import Anyway',
                style: 'default',
                onPress: confirmImport,
              },
            ] :
            importAlertData.type === 'confirm' ? [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Import',
                style: 'default',
                onPress: confirmImport,
              },
            ] : [
              {
                text: 'OK',
                style: 'default',
              },
            ]
          }
          onClose={() => setShowImportAlert(false)}
        />

        {/* Info Alert */}
        <ThemedAlert
          visible={showInfoAlert}
          title="Import & Export Data"
          message="📤 Export Data: Creates a CSV file with all your transactions that you can open and edit in Excel, Google Sheets, or any spreadsheet app

📥 Import Data: Import transactions from a CSV file you've created or edited

CSV Format: Date (DD/MM/YYYY), Time (HH:MM), Amount, Place, Category, Note

Valid Categories: Food, Bills, Entertainment, Shopping, Health, Groceries, Rent, Education, Internet, Fuel, Travel, Other

Tip: Export your data first to see the correct format, then you can edit it and import it back!"
          icon="information-circle-outline"
          buttons={[
            {
              text: 'Got it',
              style: 'default',
            },
          ]}
          onClose={() => setShowInfoAlert(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 72, // Account for header height (16 + 16 padding + ~40 for content)
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginLeft: 8,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  unselectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  actionButtonSubtext: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 12,
  },
});