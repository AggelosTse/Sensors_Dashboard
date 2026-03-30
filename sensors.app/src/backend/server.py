from flask import Flask, request
import sqlite3


app = Flask(__name__)

@app.route('/loginValidation', methods=['POST'])
def validate():
    
    try:
        
        sqlConn = sqlite3.connect('sensorsDashboard.db')
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = 'SELECT username, password FROM users WHERE username = ?'
        
        data = request.get_json()
        username = data.get("username")
        
        cursor.execute(query, (username,))
        
        result = cursor.fetchone()   #afou username kleidi, enas mono tha mporei na to exei
        cursor.close()
        
        if result == None :
            pass
        elif result[0] != username:
            pass
        else:
            pass
        
    except sqlite3.Error as error:
        pass
    
    finally:
     
        if sqlConn:
            sqlConn.close()