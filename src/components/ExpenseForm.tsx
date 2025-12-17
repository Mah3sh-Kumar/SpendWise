import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../hooks/useTheme';
import { Transaction, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { ThemedAlert } from './ThemedAlert';

// Helper function to get category icons
const getCategoryIcon = (category: Category): string => {
  const iconMap: Record<Category, string> = {
    [Category.FOOD]: 'restaurant-outline',
    [Category.BILLS]: 'receipt-outline',
    [Category.ENTERTAINMENT]: 'game-controller-outline',
    [Category.SHOPPING]: 'bag-outline',
    [Category.HEALTH]: 'medical-outline',
    [Category.GROCERIES]: 'basket-outline',
    [Category.RENT]: 'home-outline',
    [Category.EDUCATION]: 'school-outline',
    [Category.INTERNET]: 'wifi-outline',
    [Category.FUEL]: 'car-outline',
    [Category.TRAVEL]: 'airplane-outline',
    [Category.OTHER]: 'ellipsis-horizontal-outline',
  };
  return iconMap[category] || 'ellipsis-horizontal-outline';
};

interface ExpenseFormProps {
  onLogExpense: (transaction: Omit<Transaction, 'id'>) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onLogExpense }) => {
  const [amount, setAmount] = useState('');
  const [place, setPlace] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [note, setNote] = useState('');
  const { theme } = useTheme();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState({ title: '', message: '' });

  const handleCategoryChange = (selectedCategory: Category) => {
    setCategory(selectedCategory);
    if (selectedCategory === Category.OTHER) {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  const showValidationError = (title: string, message: string) => {
    setValidationMessage({ title, message });
    setShowValidationAlert(true);
  };

  const handleSubmit = () => {
    // Sanitize inputs
    const sanitizedAmount = amount.trim();
    const sanitizedPlace = place.trim();
    const sanitizedCustomCategory = customCategory.trim();
    const sanitizedNote = note.trim();

    // Validate required fields
    if (!sanitizedAmount || !sanitizedPlace) {
      showValidationError('Missing Information', 'Please fill in amount and place.');
      return;
    }

    // Validate place length
    if (sanitizedPlace.length > 50) {
      showValidationError('Invalid Input', 'Place name must be less than 50 characters.');
      return;
    }

    if (category === Category.OTHER && !sanitizedCustomCategory) {
      showValidationError('Missing Category', 'Please enter a custom category name.');
      return;
    }

    // Validate custom category length
    if (category === Category.OTHER && sanitizedCustomCategory.length > 30) {
      showValidationError('Invalid Input', 'Custom category name must be less than 30 characters.');
      return;
    }

    const parsedAmount = parseFloat(sanitizedAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showValidationError('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    // Use custom category if OTHER is selected, otherwise use the selected category
    const finalCategory = category === Category.OTHER && sanitizedCustomCategory
      ? sanitizedCustomCategory as Category
      : category;

    onLogExpense({
      amount: parsedAmount,
      place: sanitizedPlace,
      category: finalCategory,
      note: sanitizedNote,
      timestamp: Date.now()
    });

    // Reset form
    setAmount('');
    setPlace('');
    setNote('');
    setCustomCategory('');
    setShowCustomCategory(false);
    // Keep category as users often log similar expenses

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Quick Log</Text>
      </View>

      <View style={styles.form}>
        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Amount</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
            <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>₹</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Place */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Where</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
            <Ionicons
              name="location-outline"
              size={16}
              color={theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={place}
              onChangeText={setPlace}
              placeholder="e.g. Starbucks"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
          <TouchableOpacity
            style={[styles.pickerContainer, {
              borderColor: isPickerOpen ? theme.colors.primary : theme.colors.border,
              backgroundColor: theme.colors.card
            }]}
            onPress={() => setIsPickerOpen(true)}
            activeOpacity={0.7}
          >
            <View 
              style={[
                styles.categoryColorIndicator,
                { backgroundColor: (CATEGORY_COLORS[category] || theme.colors.textSecondary) + '20' }
              ]}
            >
              <Ionicons
                name={getCategoryIcon(category) as any}
                size={12}
                color={CATEGORY_COLORS[category] || theme.colors.textSecondary}
              />
            </View>
            <Text style={[styles.pickerPlaceholder, {
              color: theme.colors.text,
              flex: 1,
              fontSize: 16,
              fontWeight: '500'
            }]}>
              {category}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Custom Category Grid Modal */}
          <Modal
            visible={isPickerOpen}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsPickerOpen(false)}
          >
            <TouchableOpacity
              style={styles.pickerOverlay}
              activeOpacity={1}
              onPress={() => setIsPickerOpen(false)}
            >
              <TouchableOpacity
                style={[styles.categoryModal, { backgroundColor: theme.colors.card }]}
                activeOpacity={1}
                onPress={() => {}} // Prevent modal from closing when tapping inside
              >
                <View style={[styles.categoryHeader, { borderBottomColor: theme.colors.border }]}>
                  <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>Select Category</Text>
                  <TouchableOpacity
                    onPress={() => setIsPickerOpen(false)}
                    style={styles.categoryCloseButton}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.categoryGrid}>
                  {Object.values(Category).map((cat) => {
                    const isSelected = category === cat;
                    const categoryColor = CATEGORY_COLORS[cat] || theme.colors.textSecondary;
                    
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryItem,
                          {
                            backgroundColor: isSelected ? categoryColor + '15' : theme.colors.background,
                            borderColor: isSelected ? categoryColor : theme.colors.border,
                            borderWidth: isSelected ? 2 : 1,
                          }
                        ]}
                        onPress={() => {
                          handleCategoryChange(cat);
                          setIsPickerOpen(false);
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch (error) {
                            console.warn('Haptics not available:', error);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View 
                          style={[
                            styles.categoryColorDot,
                            { backgroundColor: categoryColor }
                          ]}
                        />
                        <Text 
                          style={[
                            styles.categoryText,
                            { 
                              color: isSelected ? categoryColor : theme.colors.text,
                              fontWeight: isSelected ? '600' : '500'
                            }
                          ]}
                        >
                          {cat}
                        </Text>
                        {isSelected && (
                          <Ionicons 
                            name="checkmark-circle" 
                            size={16} 
                            color={categoryColor}
                            style={styles.categoryCheckmark}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Custom Category Input (shown when OTHER is selected) */}
        {showCustomCategory && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Custom Category</Text>
            <View style={[styles.inputContainer, { borderColor: theme.colors.primary }]}>
              <Ionicons
                name="create-outline"
                size={16}
                color={theme.colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={customCategory}
                onChangeText={setCustomCategory}
                placeholder="Enter category..."
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
              />
            </View>
          </View>
        )}

        {/* Note */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Note (Optional)</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
            <Ionicons
              name="document-text-outline"
              size={16}
              color={theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="Details..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: (!amount || !place || (category === Category.OTHER && !customCategory.trim())) ? 0.5 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={!amount || !place || (category === Category.OTHER && !customCategory.trim())}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text style={styles.submitButtonText}>Save Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Validation Alert */}
      <ThemedAlert
        visible={showValidationAlert}
        title={validationMessage.title}
        message={validationMessage.message}
        icon="alert-circle-outline"
        buttons={[
          {
            text: 'OK',
            style: 'default',
          },
        ]}
        onClose={() => setShowValidationAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  pickerPlaceholder: {
    flex: 1,
  },
  categoryColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  categoryModal: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryCloseButton: {
    padding: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  categoryItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 48,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryText: {
    flex: 1,
    fontSize: 14,
  },
  categoryCheckmark: {
    marginLeft: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
    minHeight: 48,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});