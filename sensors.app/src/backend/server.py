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
        
        if(not username or not password):
            return jsonify({
               "messagetype": "Error",
               "message": "Missing Input"
            }),404
        
        query = 'SELECT password, role FROM users WHERE username = ?'
        
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
            
            role = result[1]
            return jsonify({
                "messagetype":"Valid",
                "message":"Logging in",
                "role": role
            }),200
    
    except sqlite3.Error as error:
        return jsonify({
            "messagetype":"Error",
            "message": str(error)
        }),404
    
    finally:
     
        if sqlConn:
            sqlConn.close()
            

@app.route('/signUp', methods=['POST'])
def signUpmanager(): 
    sqlConn = None   
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")
            
        if(not username or not password or not email or not fullName):
                return jsonify({
               "messagetype": "Error",
               "message": "Missing Input"
            }),404
                
                
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = 'SELECT username FROM users WHERE username = ?'
        
   

        cursor.execute(query, (username,))
        
        result = cursor.fetchone()   #afou username kleidi, enas mono tha mporei na to exei
        
        if result is not None:
            #username already exists, try another one
            return jsonify({
                "messagetype": "Error",
                "message" : "Account with that name already exists"
            }),404
        else:
            cursor.execute('SELECT COUNT(*) FROM users')
            user_counter = cursor.fetchone()
            counter = user_counter[0]
            
            if counter == 0:
                role = "admin"
            else:
                role = "user"
                
                
           
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
            
            


@app.route('/addsensor', methods=['GET'])
def addSensorManager(): 

    sqlConn = None
    
    sqlConn = sqlite3.connect(db_path)
    cursor = sqlConn.cursor()     

    query =  ''' SELECT s.name, c.category FROM sensors s JOIN sensor_categories c ON s.category_id == c.id'''

    cursor.execute(query)
        
    result = cursor.fetchall() 
  



@app.route('/getSensorsData', methods=['GET'])
def getsensorData(): 

    sqlConn = None

    try:
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands

        query =  ''' SELECT s.name, c.category FROM sensors s JOIN sensor_categories c ON s.category_id == c.id'''

        cursor.execute(query)
        
        result = cursor.fetchall()   
        
        sensorNames = []
        sensorCategories = []

        for row in result:
            sensorNames.append(row[0])
            sensorCategories.append(row[1])

        sensorData = {
            "names":sensorNames,
            "categories":sensorCategories
        }

        return jsonify(sensorData)

        
    except sqlite3.Error as error:
        return jsonify({
            "message": str(error)
        }),404

    finally:
     
        if sqlConn:
            sqlConn.close()



#ADMIN ENDPOINTS

@app.route('/adduser', methods=['POST'])
def addUserManager(): 
    
    sqlConn = None   
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")
        role = data.get("role")
        
        print(username,email,password,fullName,role)
        
        if(not username or not password or not email or not fullName or not role):
                return jsonify({
               "messagetype": "Error",
               "message": "Missing Input"
            }),404
                
                
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = 'SELECT username FROM users WHERE username = ?'
        
   

        cursor.execute(query, (username,))
        
        result = cursor.fetchone()   #afou username kleidi, enas mono tha mporei na to exei
        
        if result is not None:
            #username already exists, try another one
            return jsonify({
                "messagetype": "Error",
                "message" : "Account with that name already exists"
            }),404
        else:
            #FIX ORDER
            query = '''
                INSERT INTO users (username, password, role,email, fullName)   
                VALUES (?, ?, ?, ?, ?)'''      
                
            cursor.execute(query, (username,password,role,email,fullName,))
                
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
            
            
@app.route('/getUserData', methods=['GET'])
def getuserdata():      
     
    sqlConn = None
    try:

        
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = 'SELECT id,username,email,role,password,fullName FROM users'
        
        cursor.execute(query)
        
        result = cursor.fetchall()   
        
        id=[]
        usernames = []
        emails = []
        passwords=[]
        fullNames=[]
        roles = []
        
        
        for row in result:
            id.append(row[0])
            usernames.append(row[1])
            emails.append(row[2])
            roles.append(row[3])
            passwords.append(row[4])
            fullNames.append(row[5])
            
            
        userdata  = {
            "id":id,
            "usernames": usernames,
            "passwords":passwords,
            "fullnames":fullNames,
            "emails": emails,
            "roles":roles
        }
        
        return jsonify(userdata)

        
        
    except sqlite3.Error as error:
        return jsonify({
            "message": str(error)
        }),404
    
    finally:
     
        if sqlConn:
            sqlConn.close()
            



@app.route('/edituser', methods=['POST'])
def editUserManager():
    
    sqlConn = None   
    try:
        data = request.get_json()
        userid = data.get("id")
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")
        role = data.get("role")
        
        if(not username or not password or not email or not fullName or not role):
                return jsonify({
               "messagetype": "Error",
               "message": "Missing Input"
            }),404
                
                
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = '''
            UPDATE users SET username = ?, password = ?, email = ?, fullName = ?, role = ?
            WHERE id = ?'''      
            
        cursor.execute(query, (username,password,email,fullName, role, userid))
            
        sqlConn.commit()
            
            
        cursor.close()
        
        return jsonify({
            "messagetype": "Valid",
            "message" : "Account updated successfully"
        }),200
         
    except sqlite3.Error as error:
        return jsonify({
            "messagetype":"Error",
            "message": str(error)
        }),404
    
    finally:
     
        if sqlConn:
            sqlConn.close()
            
 
    
@app.route('/deleteuser', methods=['POST'])
def deleteUserManager():
    
    sqlConn = None
    try:
        
         data = request.get_json()
         userid = data.get("id")
                
         sqlConn = sqlite3.connect(db_path)
         cursor = sqlConn.cursor()       #executes sql commands
        
         query = '''
            DELETE FROM users WHERE id = ?'''      
            
         cursor.execute(query, (userid,))
            
         sqlConn.commit()
            
            
         cursor.close()
         
         return jsonify({
            "messagetype":"Success",
            "message": "User deleted."
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