const sqlite3 = require('sqlite3').verbose();
// פתיחת מאגר הנתונים (ייווצר קובץ אם אין כזה)
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});
// db.run("DROP TABLE IF EXISTS users", (err) => {
//     if (err) {
//         console.error('Error dropping table:', err.message);
//     } else {
//         console.log('Table dropped successfully');
//     }
// });
// יצירת טבלה עבור המשתמשים אם היא לא קיימת
db.run(`CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    password TEXT,
    keywords TEXT,
    language  TEXT,
    country  TEXT,
    category  TEXT

)`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    }
});
// פונקציה להוספת משתמש
const addUser = (userId, name, email, password, keywords, language, country,category, callback) => {
    console.log({ userId, name, email, password, keywords, language, country,category });
    const stmt = db.prepare("INSERT INTO users (userId, name, email,password, keywords, language, country,category ) VALUES (?, ?, ?,?,?,?,?,?)");
    stmt.run(userId, name, email, password, keywords, language, country,category, (err) => {
        if (err) {
            console.error('Error inserting user:', err.message);
            callback(err); // שולח את השגיאה אם יש
        } else {
            console.log(`User ${userId} added successfully`);
            callback(null, `User ${userId} added successfully`); // מחזיר תשובה במקרה של הצלחה
        }
    });
};
// פונקציה לעדכון משתמש
const updateUser = (userId, name, email, password, keywords, language, country, category, callback) => {
    const fields = { name, email, password, keywords, language, country, category };

      // סנן את השדות עם ערכים שאינם null או undefined
      const updates = Object.entries(fields)
      .filter(([key, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key} = ?`);

  // אם אין שדות לעדכון, מחזירים הודעה
  if (updates.length === 0) {
      return callback(null, `No valid fields to update for user ${userId}`);
  }

  // יוצרים מערך של ערכים לפי הסדר הנכון
  const params = Object.values(fields)
      .filter(value => value !== null && value !== undefined)
    params.push(userId);
    console.log({params,updates});
    
    const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE userId = ?`);
    stmt.run(params, (err) => {
        if (err) {
            console.error('Error updating user:', err.message);
            callback(err);
        } else {
            console.log(`User ${userId} updated successfully`);
            callback(null, `User ${userId} updated successfully`);
        }
    });
};

// פונקציה לקרוא את פרטי המשתמש
const getUser = (email, password, callback) => {
    console.log({ password }, { email });
    db.get("SELECT * FROM users WHERE password = ? AND email=?", [password, email], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err.message);
        } else {
            console.log({ row });
            callback(row); // מחזיר את פרטי המשתמש
        }
    });
};
// סגירת החיבור למסד הנתונים
const closeDB = () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database closed successfully');
        }
    });
};
// סגירת מאגר הנתונים בסיום
module.exports = {
    addUser,
    updateUser,
    getUser,
    closeDB,
};
