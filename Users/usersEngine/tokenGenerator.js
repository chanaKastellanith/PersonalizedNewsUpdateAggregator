require('dotenv').config();  // טוען את המשתנים מקובץ .env
const fs = require('fs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;  
// פונקציה ליצירת טוקן
const generateToken = (userId) => {
  const payload = {
    userId: userId
    
  };

  const options = {
    expiresIn: '1h',  // הגדרת זמן פקיעה, למשל 1 שעה
  };

  // יצירת טוקן
  const token = jwt.sign(payload, SECRET_KEY, options);
  saveToken(userId, token);
  return token;
};

// פונקציה לאימות טוקן
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;  // מחזירים את המידע שהוצפן בטוקן
  } catch (error) {
    throw new Error('Token is invalid or expired');
  }
};
const path = './tokens.json'; 

const saveToken = (userId, token) => {
    // קרא את הקובץ JSON הקיים (אם יש)
    fs.readFile(path, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading file:', err);
            return;
        }
        
        // אם הקובץ ריק או לא קיים, יצור אובייקט חדש
        const tokens = data ? JSON.parse(data) : {};

        // שמור את הטוקן של המשתמש
        tokens[userId] = token;

        // שמור את הקובץ מחדש עם הטוקן
        fs.writeFile(path, JSON.stringify(tokens), 'utf8', (err) => {
            if (err) {
                console.error('Error saving token:', err);
            } else {
                console.log('Token saved successfully');
            }
        });
    });
};
const getToken = (userId, callback) => {
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            callback(null); // במקרה של טעות קריאה, מחזירים null
            return;
        }

        const tokens = data ? JSON.parse(data) : {};
        const token = tokens[userId] || null;
        callback(token);
    });
};

module.exports = { generateToken, verifyToken,getToken };
