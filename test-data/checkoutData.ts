export const checkoutData = {
  customerInfo: {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345'
  },

  productName: 'Sauce Labs Backpack',
  paymentInfo: {
    label: 'Payment Information:',
    value: 'SauceCard'
  },
  shippingInfo: {
    label: 'Shipping Information:',
    value: 'Free Pony Express Delivery!'
  },
  totalInfo: {
    label: 'Price Total',
    subtotal: 'Item total: $29.99',
    tax: 'Tax:',
    total: 'Total:'
  },

  products: [
    'Sauce Labs Bike Light',
    'Sauce Labs Bolt T-Shirt'
  ],

  completeHeader: 'Thank you for your order!',
  completeText:
    'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
  checkoutTitle: 'Checkout: Your Information',
  cartTitle: 'Your Cart',

  firstNameErrorMessage: 'Error: First Name is required',
  lastNameErrorMessage: 'Error: Last Name is required',
  postalCodeErrorMessage: 'Error: Postal Code is required',

};

export const invalidCheckoutCases = [
  {
    testName: 'first name is empty',
    firstName: '',
    lastName: checkoutData.customerInfo.lastName,
    postalCode: checkoutData.customerInfo.postalCode,
    expectedError: checkoutData.firstNameErrorMessage,
  },
  {
    testName: 'last name is empty',
    firstName: checkoutData.customerInfo.firstName,
    lastName: '',
    postalCode: checkoutData.customerInfo.postalCode,
    expectedError: checkoutData.lastNameErrorMessage,
  },
  {
    testName: 'postal code is empty',
    firstName: checkoutData.customerInfo.firstName,
    lastName: checkoutData.customerInfo.lastName,
    postalCode: '',
    expectedError: checkoutData.postalCodeErrorMessage,
  },
];