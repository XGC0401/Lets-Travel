import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const currency = ref(localStorage.getItem('currency') || 'USD')
  
  // Exchange rates (base USD)
  const exchangeRates = ref({
    USD: 1.00,
    EUR: 0.92,
    GBP: 0.79,
    HKD: 7.83,
    JPY: 149.50,
    CNY: 7.24,
    AUD: 1.52,
    SGD: 1.35
  })

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    HKD: 'HK$',
    JPY: '¥',
    CNY: '¥',
    AUD: 'A$',
    SGD: 'S$'
  }

  function updateCurrency() {
    localStorage.setItem('currency', currency.value)
  }

  function convertPrice(priceUSD, toCurrency = currency.value) {
    const rate = exchangeRates.value[toCurrency] || 1
    return (priceUSD * rate).toFixed(2)
  }

  function formatPrice(priceUSD, toCurrency = currency.value) {
    const converted = convertPrice(priceUSD, toCurrency)
    const symbol = currencySymbols[toCurrency] || '$'
    return `${symbol}${converted}`
  }

  return {
    currency,
    exchangeRates,
    currencySymbols,
    updateCurrency,
    convertPrice,
    formatPrice
  }
})
