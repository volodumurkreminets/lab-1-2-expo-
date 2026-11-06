import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

export default function App() {
  const [dbRecords, setDbRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Стейти для полів теми
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPhone, setInputPhone] = useState('');

  // Стейти для помилок валідації
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');

  // 1. Отримання даних з API (Fetch API)
  useEffect(() => {
    fetchUsersFromApi();
  }, []);

  const fetchUsersFromApi = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      // Мапимо дані з API у наш формат
      const formattedData = data.slice(0, 5).map((user) => ({
        id: user.id.toString(),
        fullName: user.name,
        email: user.email.toLowerCase(),
        phone: user.phone,
      }));

      setDbRecords(formattedData);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити дані з сервера');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Валідація RegEx
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return cleanPhone.length >= 7;
  };

  // 3. Додавання нового запису
  const handleAddRecord = () => {
    let isValid = true;

    if (!inputName.trim()) {
      setNameError("Введіть ім'я користувача");
      isValid = false;
    } else {
      setNameError('');
    }

    if (!inputEmail.trim()) {
      setEmailError('Введіть електронну пошту');
      isValid = false;
    } else if (!validateEmail(inputEmail)) {
      setEmailError('Некоректний формат пошти (user@domain.com)');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!inputPhone.trim()) {
      setPhoneError('Введіть номер телефону');
      isValid = false;
    } else if (!validatePhone(inputPhone)) {
      setPhoneError('Некоректний номер (мінімум 7 цифр)');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (!isValid) return;

    const newRecord = {
      id: Date.now().toString(),
      fullName: inputName.trim(),
      email: inputEmail.trim(),
      phone: inputPhone.trim(),
    };

    setDbRecords([newRecord, ...dbRecords]);

    setInputName('');
    setInputEmail('');
    setInputPhone('');
    setNameError('');
    setEmailError('');
    setPhoneError('');

    Alert.alert('Успіх', 'Користувача додано!');
  };

  const handleDeleteRecord = (id) => {
    setDbRecords(dbRecords.filter((item) => item.id !== id));
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.mainContainer, theme.bg]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Шапка */}
          <View style={styles.topBar}>
            <View>
              <Text style={[styles.appTitle, theme.textPrimary]}>База Даних (API)</Text>
              <Text style={[styles.appSubTitle, theme.textSecondary]}>
                Записи в системі: {dbRecords.length}
              </Text>
            </View>

            <View style={styles.switchWrapper}>
              <Text style={styles.switchIcon}>{isDark ? '🌙' : '☀️'}</Text>
              <Switch
                value={isDark}
                onValueChange={(val) => setIsDark(val)}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              />
            </View>
          </View>

          {/* Форма додавання */}
          <View style={[styles.formContainer, theme.cardBg]}>
            <Text style={[styles.formHeader, theme.textPrimary]}>Додати запис локально</Text>

            <TextInput
              style={[
                styles.customInput,
                theme.inputStyle,
                nameError ? styles.inputErrorBorder : null,
              ]}
              placeholder="ПІБ / Ім'я"
              placeholderTextColor={isDark ? '#888' : '#aaa'}
              value={inputName}
              onChangeText={(text) => {
                setInputName(text);
                if (nameError) setNameError('');
              }}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <TextInput
              style={[
                styles.customInput,
                theme.inputStyle,
                emailError ? styles.inputErrorBorder : null,
              ]}
              placeholder="Електронна пошта (user@domain.com)"
              placeholderTextColor={isDark ? '#888' : '#aaa'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={inputEmail}
              onChangeText={(text) => {
                setInputEmail(text);
                if (emailError) setEmailError('');
              }}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TextInput
              style={[
                styles.customInput,
                theme.inputStyle,
                phoneError ? styles.inputErrorBorder : null,
              ]}
              placeholder="Номер телефону"
              placeholderTextColor={isDark ? '#888' : '#aaa'}
              keyboardType="phone-pad"
              value={inputPhone}
              onChangeText={(text) => {
                setInputPhone(text);
                if (phoneError) setPhoneError('');
              }}
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, theme.buttonStyle]}
              activeOpacity={0.8}
              onPress={handleAddRecord}
            >
              <Text style={styles.submitButtonText}>+ Зберегти в базу</Text>
            </TouchableOpacity>
          </View>

          {/* Індикатор завантаження або Список записів */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, theme.textPrimary]}>Записи з REST API</Text>
            <TouchableOpacity onPress={fetchUsersFromApi}>
              <Text style={styles.reloadText}>Оновити 🔄</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#079455" style={{ marginTop: 20 }} />
          ) : (
            dbRecords.map((item) => (
              <View key={item.id} style={[styles.recordCard, theme.cardBg]}>
                <View style={styles.recordInfo}>
                  <Text style={[styles.recordName, theme.textPrimary]}>{item.fullName}</Text>
                  <Text style={[styles.recordDetail, theme.textSecondary]}>📧 {item.email}</Text>
                  <Text style={[styles.recordDetail, theme.textSecondary]}>📞 {item.phone}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteRecord(item.id)}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Теми оформлення
const lightTheme = StyleSheet.create({
  bg: { backgroundColor: '#F2F4F7' },
  cardBg: { backgroundColor: '#FFFFFF', borderColor: '#EAECF0' },
  textPrimary: { color: '#101828' },
  textSecondary: { color: '#667085' },
  inputStyle: { backgroundColor: '#F9FAFB', borderColor: '#D0D5DD', color: '#101828' },
  buttonStyle: { backgroundColor: '#079455' },
});

const darkTheme = StyleSheet.create({
  bg: { backgroundColor: '#121212' },
  cardBg: { backgroundColor: '#1E1E1E', borderColor: '#2A2A2A' },
  textPrimary: { color: '#F5F5F5' },
  textSecondary: { color: '#9E9E9E' },
  inputStyle: { backgroundColor: '#2C2C2C', borderColor: '#3A3A3A', color: '#FFFFFF' },
  buttonStyle: { backgroundColor: '#12B76A' },
});

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  appSubTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchIcon: {
    fontSize: 18,
  },
  formContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  formHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  customInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    fontSize: 14,
  },
  inputErrorBorder: {
    borderColor: '#F04438',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#F04438',
    fontSize: 12,
    marginTop: 3,
    marginLeft: 4,
  },
  submitButton: {
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  reloadText: {
    color: '#079455',
    fontWeight: '600',
    fontSize: 14,
  },
  recordCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 10,
  },
  deleteBtnText: {
    color: '#F04438',
    fontSize: 18,
    fontWeight: 'bold',
  },
});