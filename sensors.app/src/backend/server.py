from flask import Flask, request
from flask_cors import CORS
import sqlite3


app = Flask(__name__)

@app.route('/loginValidation', methods=['POST'])
def logInvalidate():
    
    try:
        
        sqlConn = sqlite3.connect('sensorsDashboard.db')
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = 'SELECT username, password FROM users WHERE username = ?'
        
        data = request.get_json()
        username = data.get("username")
        
        cursor.execute(query, (username,))
        
        result = cursor.fetchone()   #afou username kleidi, enas mono tha mporei na to exei
        
        if result == None :
            pass
        elif result[0] != username:
            pass
        else:
            pass
        
        cursor.close()

    except sqlite3.Error as error:
        pass
    
    finally:
     
        if sqlConn:
            sqlConn.close()
            

@app.route('/signUp', methods=['POST'])
def signUpmanager():    
    try:
        
        sqlConn = sqlite3.connect('sensorsDashboard.db')
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = 'SELECT username FROM users WHERE username = ?'
        
        data = request.get_json()
        username = data.get("username")
        
        cursor.execute(query, (username,))
        
        result = cursor.fetchone()   #afou username kleidi, enas mono tha mporei na to exei
        
        if result is not None:
            #username already exists, try another one
            pass
        
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")
        
        query = '''
        INSERT INTO users (username, password, email, fullName)
        VALUES (?, ?, ?, ?)'''      
          
        cursor.execute(query, (username,password,email,fullName))
        
        sqlConn.commit()
        cursor.close()
        
    except sqlite3.Error as error:
        pass
    
    finally:
     
        if sqlConn:
            sqlConn.close()
            
if __name__ == '__main__':
    app.run(debug=True, port=8001)