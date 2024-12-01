
const { DaprClient, HttpMethod } = require('@dapr/dapr');
const daprClient = new DaprClient(); 
const serviceName = 'usersAccessor';

const validateName = (name) => {
    if (!name || name.length < 3) {
        return 'שם המשתמש חייב להיות באורך של לפחות 3 תווים';
    }
    return null;
};

const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return 'הסיסמה חייבת להיות באורך של לפחות 6 תווים';
    }
    return null;
};

const validateEmail = (email) => {
    const validator = require('validator');
    if (!email || !validator.isEmail(email)) {
        return 'הכתובת אימייל אינה תקינה';
    }
    return null;
};

const validateUserExists = async (email,password) => {
    try {
        const response = await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, { email,password });
        if (response) {
            return `המשתמש עם מזהה ${email} כבר קיים`;
        }
        return true;
    } catch (error) {
        return 'שגיאה בחיבור לשרת ה-usersAccessor';
    }
};

const validateNewUser = async ( name, email, password) => {
    let error = validateName(name);
    if (error) return error;

    error = validateEmail(email);
    if (error) return error;

    error = validatePassword(password);
    if (error) return error;

    return true;
};

module.exports = {
    validateNewUser,
    validateUserExists
};
