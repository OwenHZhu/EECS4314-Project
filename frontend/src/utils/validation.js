/**
 * ./utils/validation.js
 * 
 * Regular expression used to validate email format.
 * Ensures the email contains valid characters, an '@' symbol,
 * a domain name, and a top-level domain of at least two letters.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Password validation regex: enforces minimum length of 12 characters.
 */
const PW_LENGTH_REGEX = /^.{12,}$/;
/**
 * Password validation regex: requires at least one uppercase letter.
 */
const PW_UPPER_REGEX = /[A-Z]+/;
/**
 * Password validation regex: requires at least one lowercase letter.
 */
const PW_LOWER_REGEX = /[a-z]+/;
/**
 * Password validation regex: requires at least one numeric digit.
 */
const PW_NUMBER_REGEX = /[0-9]+/;
/**
 * Password validation regex: requires at least one special character.
 * Uses \W to match non-word characters.
 */
const PW_SPECIAL_REGEX = /[\W]+/;

/**
 * Username validation regex: enforces length between 5 and 12 characters.
 */
const USERNAME_LENGTH_REGEX = /^.{5,12}$/;
/**
 * Username validation regex: allows only letters, numbers, and underscores.
 */
const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;

/**
 * Validates whether a given email string matches the expected email format.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid, otherwise false.
 */
export function validateEmail(email) {
    return EMAIL_REGEX.test(email);
}

/**
 * Validates a password against multiple security rules:
 * - Minimum length of 12 characters
 * - Contains uppercase letters
 * - Contains lowercase letters
 * - Contains numbers
 * - Contains special characters
 *
 * Returns an array of error messages. If the array is empty,
 * the password meets all requirements.
 *
 * @param {string} password - The password to validate.
 * @returns {string[]} A list of validation error messages.
 */
export function validatePassword(password) {
    const errors = [];

    if (!PW_LENGTH_REGEX.test(password)) {
        errors.push("Password must be at least 12 characters long.");
    }
    if (!PW_UPPER_REGEX.test(password)) {
        errors.push("Password needs an uppercase letter.");
    }
    if (!PW_LOWER_REGEX.test(password)) {
        errors.push("Password needs a lowercase letter.");
    }
    if (!PW_NUMBER_REGEX.test(password)) {
        errors.push("Password needs a number.");
    }
    if (!PW_SPECIAL_REGEX.test(password)) {
        errors.push("Password needs a special character.");
    }

    return errors;
}

/**
 * Validates a username based on two rules:
 * - Must be between 5 and 12 characters long
 * - Must contain only letters, numbers, and underscores
 *
 * Returns an array of error messages. If empty, the username is valid.
 *
 * @param {string} username - The username to validate.
 * @returns {string[]} A list of validation error messages.
 */
export function validateUsername(username) {
    const errors = [];

    if (!USERNAME_LENGTH_REGEX.test(username)) {
        errors.push("Username should be 5 to 12 characters long.");
    }

    if (!USERNAME_REGEX.test(username)) {
        errors.push("Username can only have letters, numbers, and _");
    }

    return errors;
}