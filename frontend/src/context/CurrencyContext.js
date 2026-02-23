import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create context
const CurrencyContext = createContext();

// Custom hook
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Available currencies
const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', rate: 1, name: 'US Dollar' },
  EUR: { symbol: '€', code: 'EUR', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', code: 'GBP', rate: 0.79, name: 'British Pound' },
  INR: { symbol: '₹', code: 'INR', rate: 83.12, name: 'Indian Rupee' },
  JPY: { symbol: '¥', code: 'JPY', rate: 151.23, name: 'Japanese Yen' },
  CNY: { symbol: '¥', code: 'CNY', rate: 7.24, name: 'Chinese Yuan' },
  AUD: { symbol: 'A$', code: 'AUD', rate: 1.53, name: 'Australian Dollar' },
  CAD: { symbol: 'C$', code: 'CAD', rate: 1.36, name: 'Canadian Dollar' },
  SGD: { symbol: 'S$', code: 'SGD', rate: 1.35, name: 'Singapore Dollar' },
  AED: { symbol: 'د.إ', code: 'AED', rate: 3.67, name: 'UAE Dirham' }
};

// Provider component
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState(CURRENCIES);
  const [loading, setLoading] = useState(false);

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency');
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferred_currency', currency);
  }, [currency]);

  // Fetch latest exchange rates (optional - would need API)
  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      // In production, you would fetch from an API like:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      
      // For now, using static rates
      console.log('Using static exchange rates');
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Format amount in current currency
  const formatAmount = useCallback((amount, showCode = false) => {
    const selectedCurrency = rates[currency] || rates.USD;
    const convertedAmount = amount * selectedCurrency.rate;
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    if (showCode) {
      return `${formatter.format(convertedAmount)} ${selectedCurrency.code}`;
    }
    return formatter.format(convertedAmount);
  }, [currency, rates]);

  // Convert amount to different currency
  const convertAmount = useCallback((amount, fromCurrency, toCurrency) => {
    const fromRate = rates[fromCurrency]?.rate || 1;
    const toRate = rates[toCurrency]?.rate || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }, [rates]);

  // Get currency symbol
  const getSymbol = useCallback((currencyCode = currency) => {
    return rates[currencyCode]?.symbol || '$';
  }, [currency, rates]);

  // Get currency name
  const getName = useCallback((currencyCode = currency) => {
    return rates[currencyCode]?.name || currencyCode;
  }, [currency, rates]);

  // Change currency
  const changeCurrency = useCallback((newCurrency) => {
    if (rates[newCurrency]) {
      setCurrency(newCurrency);
    }
  }, [rates]);

  // Get all available currencies
  const getAvailableCurrencies = useCallback(() => {
    return Object.keys(rates).map(code => ({
      code,
      name: rates[code].name,
      symbol: rates[code].symbol,
      rate: rates[code].rate
    }));
  }, [rates]);

  // Format price with comparison (e.g., for showing original vs converted)
  const formatWithComparison = useCallback((amount, originalCurrency) => {
    const original = rates[originalCurrency] || rates.USD;
    const current = rates[currency] || rates.USD;
    
    const originalFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: original.code
    }).format(amount);

    const convertedAmount = convertAmount(amount, originalCurrency, currency);
    const convertedFormatted = formatAmount(convertedAmount);

    return { original: originalFormatted, converted: convertedFormatted };
  }, [currency, rates, convertAmount, formatAmount]);

  const value = {
    currency,
    rates,
    loading,
    formatAmount,
    convertAmount,
    getSymbol,
    getName,
    changeCurrency,
    getAvailableCurrencies,
    formatWithComparison,
    availableCurrencies: rates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
