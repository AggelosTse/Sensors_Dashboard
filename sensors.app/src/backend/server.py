from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

import os

app = Flask(__name__)

CORS(app)

base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir,'database','sensorsDashBoard.db')

@app.route('/loginValidation', methods=['POST'])
def logInvalidate():
    sqlConn = None
    try:
        
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands
        
        
        data = request.get_json()       #request data
        username = data.get("username")
        password = data.get("password")
        
        query = 'SELECT password FROM users WHERE username = ?'

        cursor.execute(query, (username,))
        
        result = cursor.fetchone()   #afou username kleidi, enas mono tha mporei na to exei
        
        if result == None :
            return jsonify({
               "messagetype": "Error",
               "message": "No accounts with that name exist yet"
            }),404
            
        if result[0] != password:
            return jsonify({
                    "messagetype": "Error",
                    "message": "Wrong password. Try again"
                    }),404
        else:
            return jsonify({
                "messagetype":"Valid",
                "message":"Logging in"
            }),200
    
    except sqlite3.Error as error:
        return jsonify({
            "messagetype":"Error",
            "message":"Something went wrong with the database"
        }),404
    
    finally:
     
        if sqlConn:
            sqlConn.close()
            

@app.route('/signUp', methods=['POST'])
def signUpmanager(): 
    sqlConn = None   
    try:
        
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = 'SELECT username FROM users WHERE username = ?'
        
        data = request.get_json()
        username = data.get("username")
        
        cursor.execute(query, (username,))
        
        result = cursor.fetchone()   #afou username kleidi, enas mono tha mporei na to exei
        
        if result is not None:
            #username already exists, try another one
            return jsonify({
                "messagetype": "Error",
                "message" : "Account with that name already exists"
            }),404
        
        cursor.execute('SELECT COUNT(*) FROM users')
        user_counter = cursor.fetchone()
        counter = user_counter[0]
        
        if counter == 0:
            role = "admin"
        else:
            role = "user"
            
            
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")
        
        query = '''
        INSERT INTO users (username, password, email, fullName, role)
        VALUES (?, ?, ?, ?, ?)'''      
          
        cursor.execute(query, (username,password,email,fullName, role))
        
        sqlConn.commit()
        
        
        cursor.close()
        
        return jsonify({
            "messagetype": "Valid",
            "message" : "Account created successfully"
        }),200
         
    except sqlite3.Error as error:
        return jsonify({
            "messagetype":"Error",
            "message": str(error)
        }),404
    
    finally:
     
        if sqlConn:
            sqlConn.close()
            
if __name__ == '__main__':
    app.run(debug=True, port=8001)