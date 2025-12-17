import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
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

interface EditTransactionModalProps {
  isVisible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (transactionId: string, updatedData: Omit<Transaction, 'id'>) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isVisible,
  transaction,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [place, setPlace] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [note, setNote] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState({ title: '', message: '' });

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setPlace(transaction.place);
      setCategory(transaction.category as Category);
      setNote(transaction.note || '');
    }
  }, [transaction]);

  const showValidationError = (title: string, message: string) => {
    setValidationMessage({ title, message });
    setShowValidationAlert(true);
  };

  const handleSave = () => {
    if (!transaction) return;

    // Validate inputs
    const sanitizedAmount = amount.trim();
    const sanitizedPlace = place.trim();
    const sanitizedNote = note.trim();

    if (!sanitizedAmount || !sanitizedPlace) {
      showValidationError('Missing Information', 'Please fill in amount and place.');
      return;
    }

    if (sanitizedPlace.length > 50) {
      showValidationError('Invalid Input', 'Place name must be less than 50 characters.');
      return;
    }

    const parsedAmount = parseFloat(sanitizedAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showValidationError('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    onSave(transaction.id, {
      amount: parsedAmount,
      place: sanitizedPlace,
      category,
      note: sanitizedNote,
      timestamp: transaction.timestamp, // Keep original timestamp
    });

    onClose();
  };

  const handleCancel = () => {
    // Reset form to original values
    if (transaction) {
      setAmount(transaction.amount.toString());
      setPlace(transaction.place);
      setCategory(transaction.category as Category);
      setNote(transaction.note || '');
    }
    onClose();
  };

  if (!transaction) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Edit Transaction</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                  borderColor: showCategoryPicker ? theme.colors.primary : theme.colors.border,
                  backgroundColor: theme.colors.card
                }]}
                onPress={() => setShowCategoryPicker(true)}
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
                <Text style={[styles.pickerText, { color: theme.colors.text }]}>
                  {category}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

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
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border 
              }]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.categoryOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <TouchableOpacity
            style={[styles.categoryModal, { backgroundColor: theme.colors.card }]}
            activeOpacity={1}
            onPress={() => {}} // Prevent modal from closing when tapping inside
          >
            <View style={[styles.categoryHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
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
                      setCategory(cat);
                      setShowCategoryPicker(false);
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  categoryColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
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
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Category picker styles
  categoryOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  categoryModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
});