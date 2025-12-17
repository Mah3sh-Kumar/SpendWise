import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';
import { formatCurrency } from '../constants';
import { ThemedAlert } from './ThemedAlert';

interface VaultProps {
  total: number;
  onUpdateTotal: (newTotal: number) => void;
  transactions: Transaction[];
}

export const Vault: React.FC<VaultProps> = ({ total, onUpdateTotal, transactions }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(total.toString());
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const { theme } = useTheme();

  const { spentThisMonth, impliedTotal } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    const spent = transactions
      .filter(t => t.timestamp >= startOfMonth)
      .reduce((acc, t) => acc + t.amount, 0);
      
    const totalBudget = total + spent;
    
    return { 
      spentThisMonth: spent, 
      impliedTotal: totalBudget 
    };
  }, [total, transactions]);

  const percentageLeft = impliedTotal > 0 ? (total / impliedTotal) * 100 : 0;

  const handleSave = () => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateTotal(val);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
      setIsEditing(false);
    } else {
      setShowConfirmAlert(true);
    }
  };

  const handleCancel = () => {
    setInputValue(total.toString());
    setIsEditing(false);
  };

  const handleEdit = () => {
    setShowConfirmAlert(true);
  };

  const confirmEdit = () => {
    setInputValue(total.toString());
    setIsEditing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.backgroundIcon}>
        <Ionicons name="wallet-outline" size={80} color="rgba(255,255,255,0.1)" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>Remaining Balance</Text>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.5)"
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={handleEdit} activeOpacity={0.8}>
            <View style={styles.displayContainer}>
              <View style={styles.amountRow}>
                <Text style={styles.amount}>{formatCurrency(total)}</Text>
                <Text style={styles.totalAmount}>/ {formatCurrency(impliedTotal)}</Text>
                <Ionicons name="pencil" size={16} color="rgba(255,255,255,0.8)" />
              </View>
              <Text style={styles.editHint}>Tap to edit remaining</Text>
            </View>
          </TouchableOpacity>
        )}

        {!isEditing && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {Math.max(0, percentageLeft).toFixed(0)}% Left
              </Text>
              <Text style={styles.progressText}>
                {formatCurrency(spentThisMonth)} Spent this month
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${Math.min(Math.max(percentageLeft, 0), 100)}%` }
                ]}
              />
            </View>
          </View>
        )}
      </View>

      <ThemedAlert
        visible={showConfirmAlert}
        title="Edit Budget Balance"
        message={isEditing 
          ? "Please enter a valid positive number for your remaining balance."
          : "Are you sure you want to edit your remaining budget balance? This will update your current financial tracking."
        }
        icon={isEditing ? "alert-circle-outline" : "wallet-outline"}
        buttons={
          isEditing
            ? [
                {
                  text: 'OK',
                  style: 'default',
                  onPress: () => {
                    setInputValue(total.toString());
                  },
                },
              ]
            : [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Edit',
                  style: 'default',
                  onPress: confirmEdit,
                },
              ]
        }
        onClose={() => setShowConfirmAlert(false)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  content: {
    zIndex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  currencySymbol: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayContainer: {
    marginTop: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  amount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  totalAmount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 1,
  },
  editHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
  },
});