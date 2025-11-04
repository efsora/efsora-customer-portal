/**
 * Data Generator Utilities
 * Functions to generate test data
 */

/**
 * Generate random string
 * @param length - Length of string
 * @param includeNumbers - Include numbers
 */
export const generateRandomString = (length: number = 10, includeNumbers: boolean = false): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const pool = includeNumbers ? chars + numbers : chars;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += pool.charAt(Math.floor(Math.random() * pool.length));
  }
  return result;
};

/**
 * Generate random number in range
 * @param min - Minimum value
 * @param max - Maximum value
 */
export const generateRandomNumber = (min: number = 0, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random email
 * @param domain - Email domain (optional)
 */
export const generateRandomEmail = (domain: string = 'example.com'): string => {
  const username = generateRandomString(10, true).toLowerCase();
  return `${username}@${domain}`;
};

/**
 * Generate random phone number
 * @param format - Phone format (e.g., 'XXX-XXX-XXXX')
 */
export const generateRandomPhone = (format: string = 'XXX-XXX-XXXX'): string => {
  let phone = format;
  while (phone.includes('X')) {
    phone = phone.replace('X', generateRandomNumber(0, 9).toString());
  }
  return phone;
};

/**
 * Generate random date in range
 * @param startDate - Start date
 * @param endDate - End date
 */
export const generateRandomDate = (startDate?: Date, endDate?: Date): Date => {
  const start = startDate || new Date(2020, 0, 1);
  const end = endDate || new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generate random boolean
 */
export const generateRandomBoolean = (): boolean => {
  return Math.random() < 0.5;
};

/**
 * Generate random item from array
 * @param array - Array to pick from
 */
export const generateRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate random username
 * @param prefix - Username prefix (optional)
 */
export const generateRandomUsername = (prefix: string = 'user'): string => {
  return `${prefix}_${generateRandomString(8, true).toLowerCase()}`;
};

/**
 * Generate random password
 * @param length - Password length
 * @param includeSpecialChars - Include special characters
 */
export const generateRandomPassword = (
  length: number = 12,
  includeSpecialChars: boolean = true
): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = lowercase + uppercase + numbers;
  if (includeSpecialChars) {
    chars += specialChars;
  }

  let password = '';
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  if (includeSpecialChars) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate random URL
 * @param protocol - Protocol (http or https)
 * @param domain - Domain name
 */
export const generateRandomUrl = (
  protocol: 'http' | 'https' = 'https',
  domain?: string
): string => {
  const randomDomain = domain || `${generateRandomString(10).toLowerCase()}.com`;
  return `${protocol}://${randomDomain}`;
};

/**
 * Generate random address
 */
export const generateRandomAddress = (): {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
} => {
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Elm St'];
  const cities = ['Springfield', 'Riverside', 'Madison', 'Georgetown', 'Franklin'];
  const states = ['CA', 'NY', 'TX', 'FL', 'IL'];
  const countries = ['USA', 'Canada', 'UK', 'Australia'];

  return {
    street: `${generateRandomNumber(1, 9999)} ${generateRandomItem(streets)}`,
    city: generateRandomItem(cities),
    state: generateRandomItem(states),
    zipCode: generateRandomNumber(10000, 99999).toString(),
    country: generateRandomItem(countries),
  };
};

/**
 * Generate random credit card number (for testing - not real)
 * @param type - Card type (visa, mastercard, amex)
 */
export const generateRandomCreditCard = (
  type: 'visa' | 'mastercard' | 'amex' = 'visa'
): {
  number: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
} => {
  let prefix = '4'; // Visa
  let length = 16;
  let cvvLength = 3;

  if (type === 'mastercard') {
    prefix = '5';
  } else if (type === 'amex') {
    prefix = '3';
    length = 15;
    cvvLength = 4;
  }

  let number = prefix;
  for (let i = 1; i < length; i++) {
    number += generateRandomNumber(0, 9);
  }

  let cvv = '';
  for (let i = 0; i < cvvLength; i++) {
    cvv += generateRandomNumber(0, 9);
  }

  const currentYear = new Date().getFullYear();
  const expiryMonth = generateRandomNumber(1, 12).toString().padStart(2, '0');
  const expiryYear = generateRandomNumber(currentYear, currentYear + 5).toString().slice(-2);

  return {
    number,
    cvv,
    expiryMonth,
    expiryYear,
  };
};

/**
 * Generate random person data
 */
export const generateRandomPerson = (): {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: Date;
} => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

  const firstName = generateRandomItem(firstNames);
  const lastName = generateRandomItem(lastNames);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

  return {
    firstName,
    lastName,
    email,
    phone: generateRandomPhone(),
    username: generateRandomUsername(firstName.toLowerCase()),
    password: generateRandomPassword(),
    birthDate: generateRandomDate(new Date(1950, 0, 1), new Date(2005, 11, 31)),
  };
};

/**
 * Generate random company data
 */
export const generateRandomCompany = (): {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: ReturnType<typeof generateRandomAddress>;
} => {
  const suffixes = ['Inc', 'LLC', 'Corp', 'Ltd', 'Group'];
  const words = ['Tech', 'Global', 'Digital', 'Smart', 'Innovation'];

  const name = `${generateRandomItem(words)} ${generateRandomItem(suffixes)}`;
  const domain = `${generateRandomString(8).toLowerCase()}.com`;

  return {
    name,
    email: `contact@${domain}`,
    phone: generateRandomPhone(),
    website: generateRandomUrl('https', domain),
    address: generateRandomAddress(),
  };
};

/**
 * Generate random timestamp
 * @param inFuture - Generate future timestamp
 */
export const generateRandomTimestamp = (inFuture: boolean = false): number => {
  const now = Date.now();
  const oneYear = 365 * 24 * 60 * 60 * 1000;

  if (inFuture) {
    return now + Math.random() * oneYear;
  } else {
    return now - Math.random() * oneYear;
  }
};

/**
 * Generate random price
 * @param min - Minimum price
 * @param max - Maximum price
 * @param decimals - Number of decimal places
 */
export const generateRandomPrice = (
  min: number = 1,
  max: number = 1000,
  decimals: number = 2
): number => {
  const price = Math.random() * (max - min) + min;
  return parseFloat(price.toFixed(decimals));
};
