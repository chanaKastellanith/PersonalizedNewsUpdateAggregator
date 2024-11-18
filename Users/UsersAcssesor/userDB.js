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
    password TEXT

)`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    }
});
// פונקציה להוספת משתמש
const addUser = (userId, name, email,password, callback) => {
        console.log({ userId, name, email,password });
        const stmt = db.prepare("INSERT INTO users (userId, name, email,password) VALUES (?, ?, ?,?)");
        stmt.run(userId, name, email,password, (err) => {
            if (err) {
                console.error('Error inserting user:', err.message);
                callback(err); // שולח את השגיאה אם יש
            } else {
                console.log(`User ${userId} added successfully`);
                callback(null,`User ${userId} added successfully`); // מחזיר תשובה במקרה של הצלחה
            }
        });
};
// פונקציה לעדכון משתמש
const updateUser = (userId, name, email,password,callback) => {
    const stmt = db.prepare("UPDATE users SET name = ?, email = ? ,password=? WHERE userId = ?");
    stmt.run(name, email,password, userId, (err) => {
        if (err) {
            console.error('Error updating user:', err.message);
            callback(err); 
        } else {
            console.log(`User ${userId} updated successfully`);
            callback(null,`User ${userId} updated successfully`);
        }
    });
};
// פונקציה לקרוא את פרטי המשתמש
const getUser = (userId,email, callback) => {
    console.log({userId},{email});
    db.get("SELECT * FROM users WHERE userId = ? OR email=?", [userId,email], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err.message);
        } else {
            console.log({row});
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
