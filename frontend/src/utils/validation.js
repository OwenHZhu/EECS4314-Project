const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PW_LENGTH_REGEX = /^.{12,}$/;
const PW_UPPER_REGEX = /[A-Z]+/;
const PW_LOWER_REGEX = /[a-z]+/;
const PW_NUMBER_REGEX = /[0-9]+/;
const PW_SPECIAL_REGEX = /[\W]+/;


const USERNAME_LENGTH_REGEX = /^.{5,12}$/;
const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;

export function validateEmail(email) {
    return EMAIL_REGEX.test(email);
}

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