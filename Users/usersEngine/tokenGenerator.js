require('dotenv').config();  
const fs = require('fs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;  

const generateToken = (userId) => {
  const payload = {
    userId: userId
    
  };

  const options = {
    expiresIn: '1h', 
  };

  const token = jwt.sign(payload, SECRET_KEY, options);
  saveToken(userId, token);
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;  
  } catch (error) {
    throw new Error('Token is invalid or expired');
  }
};
const path = './tokens.json'; 

const saveToken = (userId, token) => {
 
    fs.readFile(path, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading file:', err);
            return;
        }
        
        const tokens = data ? JSON.parse(data) : {};

        tokens[userId] = token;

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
            callback(null); 
            return;
        }

        const tokens = data ? JSON.parse(data) : {};
        const token = tokens[userId] || null;
        callback(token);
    });
};

module.exports = { generateToken, verifyToken,getToken };
