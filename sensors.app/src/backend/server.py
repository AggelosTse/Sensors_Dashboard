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
        
        query = '''
                SELECT u.password, r.role 
                FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.username = ?
            '''
        
        cursor.execute(query, (username,))
        
        result = cursor.fetchone()   #afou username kleidi, enas mono tha mporei na to exei
        
        if result is None :
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
                
                
            tempquery = 'SELECT id FROM roles WHERE role = ?'
            cursor.execute(tempquery,(role,))
            res = cursor.fetchone()
            roleID = res[0]
           
            query = '''
            INSERT INTO users (username, password, email, fullName, role_id)
            VALUES (?, ?, ?, ?, ?)'''      
            
            cursor.execute(query, (username,password,email,fullName, roleID))
            
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
            
            
# SENSORS

@app.route('/getSensorCategories', methods=['GET'])
def sensorCategoriesManager(): 

    sqlConn = None
    try:

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()   

        query = 'SELECT category FROM sensor_categories'

        cursor.execute(query)

        result = cursor.fetchall()
        categories = []
        for row in result:
            categories.append(row[0])

        return jsonify(categories)

    except sqlite3.Error as error:
        return jsonify({
            "message": str(error)
        }),404

    finally:
     
        if sqlConn:
            sqlConn.close()



@app.route('/addsensor', methods=['POST'])
def addSensorManager(): 

    sqlConn = None
    
    try:
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()     

        data = request.get_json()
        sensorName = data.get("name")
        metadata = data.get("metadata")
        category = data.get("category")
        print(category,sensorName,metadata)

        tempquery = '''SELECT id FROM sensor_categories WHERE category = ? '''

        cursor.execute(tempquery, (category,))
        result = cursor.fetchone()

        categoryID = result[0]

       
        query = '''INSERT INTO sensors (name, metadata, category_id) VALUES (?, ?, ?)'''      
                
        cursor.execute(query, (sensorName,metadata,categoryID))
                
        sqlConn.commit()
                
                
        cursor.close()

        return jsonify({
                "messagetype": "Valid",
                "message" : "Sensor Added successfully"
            }),200

    except sqlite3.Error as error:
        return jsonify({
            "message": str(error)
        }),404

    finally:
     
        if sqlConn:
            sqlConn.close()


@app.route('/getChosenSensorData', methods=['GET'])
def chosenSensorDataManager():
    
    sqlConn = None
    try:
            sensor_id = request.args.get('id')

            sqlConn = sqlite3.connect(db_path)
            cursor = sqlConn.cursor()       #executes sql commands

            query =  ''' SELECT s.name, s.metadata, c.category FROM sensors s JOIN sensor_categories c ON s.category_id == c.id WHERE s.id = ?'''

            cursor.execute(query, (sensor_id,))
            
            result = cursor.fetchone()   
            
            sensorName = result[0]
            sensorMetadata = result[1]
            sensorCategory = result[2]
            

            

            sensorData = {
                "name":sensorName,
                "category":sensorCategory,
                "metadata": sensorMetadata
            }

            return jsonify(sensorData)
    

    except sqlite3.Error as error:
        return jsonify({
            "message": str(error)
        }),404

    finally:
     
        if sqlConn:
            sqlConn.close()




@app.route('/editSensor', methods=['POST'])
def editSensorManager(): 

    pass

@app.route('/getSensorsData', methods=['GET'])
def getsensorData(): 

    sqlConn = None


    try:

        includeAllData = request.args.get('allData', default='false').lower() == 'true'

        if not includeAllData:

            sqlConn = sqlite3.connect(db_path)
            cursor = sqlConn.cursor()       #executes sql commands

            query =  ''' SELECT s.id,s.name, c.category FROM sensors s JOIN sensor_categories c ON s.category_id == c.id'''

            cursor.execute(query)
            
            result = cursor.fetchall()   
            
            sensorIDs = []
            sensorNames = []
            sensorCategories = []

            for row in result:
                sensorIDs.append(row[0])
                sensorNames.append(row[1])
                sensorCategories.append(row[2])

            sensorData = {
                "id":sensorIDs,
                "names":sensorNames,
                "categories":sensorCategories
            }

            return jsonify(sensorData)
        

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands

        query =  ''' SELECT s.id,s.name, c.category,s.metadata FROM sensors s JOIN sensor_categories c ON s.category_id == c.id'''

        cursor.execute(query)
            
        result = cursor.fetchall()   
            
        sensorIDs = []
        sensorNames = []
        sensorCategories = []
        sensorMetadata = []

        for row in result:
                sensorIDs.append(row[0])
                sensorNames.append(row[1])
                sensorCategories.append(row[2])
                sensorMetadata.append(row[3])

        sensorData = {
                "id":sensorIDs,
                "names":sensorNames,
                "categories":sensorCategories,
                "metadata" : sensorMetadata

            }

        return jsonify(sensorData)

        
    except sqlite3.Error as error:
        return jsonify({
            "message": str(error)
        }),404

    finally:
     
        if sqlConn:
            sqlConn.close()



# USERS

@app.route('/getUserRoles', methods=['GET'])
def getRoles():

    sqlConn = None 
    try:

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()       #executes sql commands
        
        query = 'SELECT role FROM roles'
        
        cursor.execute(query)
        
        result = cursor.fetchall() 

        if result is not None: 
            roleList = []

            for row in result:
                roleList.append(row[0])
            
            return jsonify(roleList)

        else:
             return jsonify({
            "messagetype":"Error",
            "message": "No roles Found"
        }),404


    except sqlite3.Error as error:
        return jsonify({
            "messagetype":"Error",
            "message": str(error)
        }),404
    
    finally:
     
        if sqlConn:
            sqlConn.close()
            
            
        



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
      
            tempquery = 'SELECT id FROM roles WHERE role = ?'
            cursor.execute(tempquery,(role,))
            res = cursor.fetchone()
            roleID = res[0]

            query = '''
                INSERT INTO users (username, password, role_id,email, fullName)   
                VALUES (?, ?, ?, ?, ?)'''      
                
            cursor.execute(query, (username,password,roleID,email,fullName,))
                
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
        
        query ='''SELECT s.id,s.username,s.email,s.password,s.fullName, r.role
                    FROM users s
                    JOIN roles r 
                    ON s.role_id = r.id
                    ORDER BY s.id ASC
                '''
        
        cursor.execute(query)
        
        result = cursor.fetchall()   
        
        user_id=[]
        usernames = []
        emails = []
        passwords=[]
        fullNames=[]
        roles = []
        
        
        for row in result:
            user_id.append(row[0])
            usernames.append(row[1])
            emails.append(row[2])
            passwords.append(row[3])
            fullNames.append(row[4])
            roles.append(row[5])

            
        userdata  = {
            "id":user_id,
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
        

        tempquery = 'SELECT id FROM roles WHERE role = ?'
        cursor.execute(tempquery,(role,))
        res = cursor.fetchone()
        roleID = res[0]


        query = '''
            UPDATE users SET username = ?, password = ?, email = ?, fullName = ?, role_id = ?
            WHERE id = ?'''      
            
        cursor.execute(query, (username,password,email,fullName, roleID, userid))
            
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