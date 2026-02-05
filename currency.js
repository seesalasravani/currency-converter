// ============================================
// JAVASCRIPT LOGIC (currency.js)
// ============================================

// Get DOM elements
const amountInput = document.getElementById('amount');
const sourceCurrencySelect = document.getElementById('sourceCurrency');
const targetCurrencySelect = document.getElementById('targetCurrency');
const convertBtn = document.getElementById('convertBtn');
const resultDiv = document.getElementById('result');
const timestampDiv = document.getElementById('timestamp');

// Display current timestamp
function updateTimestamp() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    timestampDiv.textContent = now.toLocaleString('en-US', options);
}

updateTimestamp();

// Mock exchange rates (fallback if API fails)
// These are approximate rates and should be updated regularly in a real app
const mockRates = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    INR: 83.12,
    AUD: 1.53,
    CAD: 1.36,
    CHF: 0.88,
    CNY: 7.24,
    SEK: 10.89
};

/**
 * Convert currency using exchange rates
 * Logic: amount * (targetRate / sourceRate)
 * Example: 100 USD to EUR = 100 * (0.92 / 1.0) = 92 EUR
 */
function convertCurrency(amount, fromCurrency, toCurrency, rates) {
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    if (!fromRate || !toRate) {
        throw new Error('Invalid currency');
    }
    // Convert to USD first, then to target currency
    const result = amount * (toRate / fromRate);
    return result;
}

/**
 * Fetch live exchange rates from API
 * Using exchangerate-api.com (free tier: 1,500 requests/month)
 * Alternative APIs: fixer.io, currencyapi.com, exchangeratesapi.io
 */
async function fetchExchangeRates() {
    try {
        // Using a free API - you can replace with your preferred API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) {
            throw new Error('API request failed');
        }
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.warn('API fetch failed, using mock rates:', error);
        // Return mock rates if API fails
        return mockRates;
    }
}

/**
 * Main conversion function
 * Called when user clicks Convert button
 */
async function performConversion() {
    // Get input values
    const amount = parseFloat(amountInput.value);
    const sourceCurrency = sourceCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;
    // Validate amount
    if (isNaN(amount) || amount < 0) {
        resultDiv.innerHTML = '<span class="error">Please enter a valid amount</span>';
        return;
    }
    // Show loading state
    resultDiv.innerHTML = '<span class="loading">Converting...</span>';
    convertBtn.disabled = true;
    try {
        // Fetch exchange rates
        const rates = await fetchExchangeRates();
        // Perform conversion
        const convertedAmount = convertCurrency(amount, sourceCurrency, targetCurrency, rates);
        // Display result with 2 decimal places
        const formattedAmount = amount.toFixed(2);
        const formattedResult = convertedAmount.toFixed(2);
        resultDiv.textContent = `${formattedAmount} ${sourceCurrency} = ${formattedResult} ${targetCurrency}`;
    } catch (error) {
        // Show error message
        resultDiv.innerHTML = '<span class="error">Conversion failed. Please try again.</span>';
        console.error('Conversion error:', error);
    } finally {
        // Re-enable button
        convertBtn.disabled = false;
    }
}

// Event Listeners
convertBtn.addEventListener('click', performConversion);
// Allow Enter key to trigger conversion
amountInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        performConversion();
    }
});
// Auto-convert on currency change (optional feature)
sourceCurrencySelect.addEventListener('change', performConversion);
targetCurrencySelect.addEventListener('change', performConversion);
// Perform initial conversion on page load
performConversion();
