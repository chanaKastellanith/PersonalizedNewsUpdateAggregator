
const { DaprClient, HttpMethod } = require('@dapr/dapr'); // הייבוא של Dapr SDK
const daprClient = new DaprClient(); // יצירת אובייקט של DaprClient
const serviceName = 'usersAccessor';
// פונקציה לאימות שם משתמש
const validateName = (name) => {
    if (!name || name.length < 3) {
        return 'שם המשתמש חייב להיות באורך של לפחות 3 תווים';
    }
    return null;
};

// פונקציה לאימות סיסמה
const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return 'הסיסמה חייבת להיות באורך של לפחות 6 תווים';
    }
    return null;
};

// פונקציה לאימות אימייל
const validateEmail = (email) => {
    const validator = require('validator');
    if (!email || !validator.isEmail(email)) {
        return 'הכתובת אימייל אינה תקינה';
    }
    return null;
};

// פונקציה לאימות אם המשתמש קיים
const validateUserExists = async (email,password) => {
    try {
        const response = await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, { email,password });
        if (response) {
            console.log({response});
            return `המשתמש עם מזהה ${email} כבר קיים`;
        }
        return true;
    } catch (error) {
        console.error('Error validating user existence:', error.message);
        return 'שגיאה בחיבור לשרת ה-usersAccessor';
    }
};

// פונקציה לאימות פרטי משתמש בעת יצירת משתמש חדש
const validateNewUser = async ( name, email, password) => {
    let error = validateName(name);
    if (error) return error;

    error = validateEmail(email);
    if (error) return error;

    error = validatePassword(password);
    if (error) return error;

    // error = await validateUserExists(userId);
    // if (error) return error;
    return true;
};

// פונקציה לאימות סיסמה


module.exports = {
    validateNewUser,
    validateUserExists
};
