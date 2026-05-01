from flask import Flask, request, jsonify,make_response
from flask_cors import CORS
import sqlite3
import os
import jwt
import datetime
from functools import wraps

app = Flask(__name__)

#allows authentication on requests
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, "database", "sensorsDashBoard.db")


app.config['SECRET_KEY'] = 'your_super_secret_safe_key'



def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
      
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
        
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header

        if not token:
            return make_response(jsonify({"message": "A valid token is missing!"}), 401)

        try:
    
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
           
            current_user_username = data['username']
            current_user_role = data['role']
        except jwt.ExpiredSignatureError:
            return make_response(jsonify({"message": "Token has expired!"}), 401)
        except jwt.InvalidTokenError:
            return make_response(jsonify({"message": "Invalid token!"}), 401)
        except Exception as e:
            return make_response(jsonify({"message": str(e)}), 401)


        return f(current_user_username, current_user_role, *args, **kwargs)

    return decorator



@app.route("/loginValidation", methods=["POST"])
def logInvalidate():
    sqlConn = None
    try:

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor() 

        data = request.get_json()  
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"messagetype": "Error", "message": "Missing Input"}), 404

        query = """
                SELECT u.password, r.role 
                FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.username = ?
            """

        cursor.execute(query, (username,))

        result = cursor.fetchone()

        if result is None:
            return (
                jsonify(
                    {
                        "messagetype": "Error",
                        "message": "No accounts with that name exist yet"
                    }
                ),404
            )
        
        if result[0] != password:
            return jsonify({"messagetype": "Error", "message": "Wrong password. Try again"}),404
            
        role = result[1]


        payload = {
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
        'username': username,        
        "role": role
        }


        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")


        return jsonify({
            "messagetype": "Valid", 
            "message": "Logging in",
            "role": role,
            "token" : token
            }),200



    except sqlite3.Error as error:
        return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


@app.route("/signUp", methods=["POST"])
def signUpmanager():
    sqlConn = None
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")

        if not username or not password or not email or not fullName:
            return jsonify({"messagetype": "Error", "message": "Missing Input"}), 404

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()  # executes sql commands

        query = "SELECT username FROM users WHERE username = ?"

        cursor.execute(query, (username,))

        result = (
            cursor.fetchone()
        )  

        if result is not None:
            # username already exists, try another one
            return (
                jsonify(
                    {
                        "messagetype": "Error",
                        "message": "Account with that name already exists",
                    }
                ),
                404,
            )
        else:
            cursor.execute("SELECT COUNT(*) FROM users")
            user_counter = cursor.fetchone()
            counter = user_counter[0]

            if counter == 0:
                role = "admin"
            else:
                role = "user"

            tempquery = "SELECT id FROM roles WHERE role = ?"
            cursor.execute(tempquery, (role,))
            res = cursor.fetchone()
            roleID = res[0]

            query = """
            INSERT INTO users (username, password, email, fullName, role_id)
            VALUES (?, ?, ?, ?, ?)"""

            cursor.execute(query, (username, password, email, fullName, roleID))

            sqlConn.commit()

            cursor.close()

            return (
                jsonify(
                    {"messagetype": "Valid", "message": "Account created successfully"}
                ),
                200,
            )

    except sqlite3.Error as error:
        return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


# SENSORS


@app.route("/getSensorCategories", methods=["GET"])
@token_required
def sensorCategoriesManager(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403

    sqlConn = None
    try:

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()

        query = "SELECT category FROM sensor_categories"

        cursor.execute(query)

        result = cursor.fetchall()
        categories = []
        for row in result:
            categories.append(row[0])

        return jsonify(categories)

    except sqlite3.Error as error:
        return jsonify({"message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


@app.route("/addsensor", methods=["POST"])
@token_required
def addSensorManager(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403


    sqlConn = None

    try:
        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()

        data = request.get_json()
        sensorName = data.get("name")
        metadata = data.get("metadata")
        category = data.get("category")
        print(category, sensorName, metadata)

        tempquery = """SELECT id FROM sensor_categories WHERE category = ? """

        cursor.execute(tempquery, (category,))
        result = cursor.fetchone()

        categoryID = result[0]

        query = """INSERT INTO sensors (name, metadata, category_id) VALUES (?, ?, ?)"""

        cursor.execute(query, (sensorName, metadata, categoryID))

        sqlConn.commit()

        cursor.close()

        return (
            jsonify({"messagetype": "Valid", "message": "Sensor Added successfully"}),
            200,
        )

    except sqlite3.Error as error:
        return jsonify({"message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


# gets data from specific sensor
@app.route("/getChosenSensorData", methods=["GET"])
@token_required
def chosenSensorDataManager(username,role):


    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403


    sqlConn = None
    try:
        sensor_id = request.args.get("id")

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()  # executes sql commands

        query = """ SELECT s.name, s.metadata, c.category FROM sensors s JOIN sensor_categories c ON s.category_id = c.id WHERE s.id = ?"""

        cursor.execute(query, (sensor_id,))

        result = cursor.fetchone()

        if result is None:

            return (
                jsonify(
                    {
                        "messagetype": "Error",
                        "message": f"Sensor with ID: {sensor_id} couldnt be found",
                    }
                ),
                404,
            )

        sensorName = result[0]
        sensorMetadata = result[1]
        sensorCategory = result[2]

        sensorData = {
            "name": sensorName,
            "category": sensorCategory,
            "metadata": sensorMetadata,
        }

        return jsonify(sensorData)

    except sqlite3.Error as error:
        return jsonify({"message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


@app.route("/editSensor", methods=["POST"])
@token_required
def editSensorManager(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403

    sqlConn = None
    try:
        data = request.get_json()
        sensorID = data.get("id")
        sensorName = data.get("name")
        sensorCategory = data.get("category")
        sensorMetadata = data.get("metadata")

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()

        tempquery = "SELECT id FROM sensor_categories WHERE category = ?"
        cursor.execute(tempquery, (sensorCategory,))

        result = cursor.fetchone()
        categoryID = result[0]

        query = "UPDATE sensors SET name = ?,metadata = ?,category_id = ? WHERE id = ?"

        cursor.execute(query, (sensorName, sensorMetadata, categoryID, sensorID))

        sqlConn.commit()
        cursor.close()

        return (
            jsonify({"messagetype": "Valid", "message": "Sensor updated successfully"}),
            200,
        )

    except sqlite3.Error as error:
        return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


# returns all sensors and some of their info for the control panel
@app.route("/getSensorsData", methods=["GET"])
@token_required
def getsensorData(username,role):

    sqlConn = None

    try:

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()  


        #sensor data for the control panel sensor table
        query = """ SELECT s.id,s.name, c.category FROM sensors s JOIN sensor_categories c ON s.category_id == c.id"""

        cursor.execute(query)

        result = cursor.fetchall()

        sensorIDs = []
        sensorNames = []
        sensorCategories = []

        for row in result:
            sensorIDs.append(row[0])
            sensorNames.append(row[1])
            sensorCategories.append(row[2])

        #sensor info for the control panel graphs etc

        query = "SELECT COUNT(*) FROM sensors"
        cursor.execute(query)
        result = cursor.fetchone()
        sumOfSensors = result[0]

        query = "SELECT COUNT(*) FROM measurements"
        cursor.execute(query)
        result = cursor.fetchone()
        sumOfMeasurements = result[0]
        
        query = """
            SELECT c.category, AVG(m.value) 
            FROM sensor_categories c
            JOIN sensors s ON s.category_id = c.id
            JOIN measurements m ON m.sensor_id = s.id
            GROUP BY c.category
        """
        cursor.execute(query)
        result = cursor.fetchall() 
        
        avg_values = {}
        for row in result:
            avg_values[row[0]] = round(row[1], 2) #row[0] sensor name, row[1] values mean


        sensorData = {
            "sensorTable": {
                "id": sensorIDs,
                "names": sensorNames,
                "categories": sensorCategories
            },

            "sensorInfoStats" : {
                "sumOfSensors" : sumOfSensors,
                "sumOfMeasurements": sumOfMeasurements,
                "avgTemp" : avg_values.get("Temperature", 0),
                "avgHumid" : avg_values.get("Humidity", 0)

            }

        }

        return jsonify(sensorData)

    except sqlite3.Error as error:
        return jsonify({"message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


#measurement for a specific sensor (used for the more info graph)
@app.route("/getMeasurements", methods=["GET"])
@token_required
def getMeasurementsManager(username,role):

    sqlConn = None

    try:
        sensorID = request.args.get("id")

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()

        query = "SELECT m.value,m.timestamp FROM measurements m JOIN sensors s ON s.id = m.sensor_id WHERE s.id = ? ORDER BY m.timestamp ASC"

        cursor.execute(query, (sensorID,))

        result = cursor.fetchall()
        sensorValuesList = []
        sensorTimeStampsList = []

        for row in result:
            sensorValuesList.append(row[0])
            sensorTimeStampsList.append(row[1])

        sensorData = {"values": sensorValuesList, "timestamps": sensorTimeStampsList}

        print(jsonify(sensorData))
        return jsonify(sensorData)

    except sqlite3.Error as error:
        return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()



@app.route("/sensorNewDataStore", methods=["POST"])
@token_required
def sensorNewDataManager(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    sqlConn = None

    try:

        data = request.get_json()
        currentSensorID = data.get("sensorID")
        currentSensorValue = data.get("sensorValue")
        currentTimestamp = data.get("timestamp")
        

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()

        query = 'INSERT INTO measurements (value, timestamp, sensor_id) VALUES(?,?,?)'
    
        cursor.execute(query,(currentSensorValue,currentTimestamp,currentSensorID))
    
        sqlConn.commit() 

        return jsonify({"message" : "Valid"}), 202
    
    except sqlite3.Error as error:
            return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

            if sqlConn:
                sqlConn.close()




# USERS


@app.route("/getUserRoles", methods=["GET"])
@token_required
def getRoles(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    sqlConn = None
    try:

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()  # executes sql commands

        query = "SELECT role FROM roles"

        cursor.execute(query)

        result = cursor.fetchall()

        if result is not None:
            roleList = []

            for row in result:
                roleList.append(row[0])

            return jsonify(roleList)

        else:
            return jsonify({"messagetype": "Error", "message": "No roles Found"}), 404

    except sqlite3.Error as error:
        return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


@app.route("/adduser", methods=["POST"])
@token_required
def addUserManager(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403

    sqlConn = None
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")
        role = data.get("role")

        if not username or not password or not email or not fullName or not role:
            return jsonify({"messagetype": "Error", "message": "Missing Input"}), 404

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()  # executes sql commands

        query = "SELECT username FROM users WHERE username = ?"

        cursor.execute(query, (username,))

        result = (
            cursor.fetchone()
        )  # afou username kleidi, enas mono tha mporei na to exei

        if result is not None:
            # username already exists, try another one
            return (
                jsonify(
                    {
                        "messagetype": "Error",
                        "message": "Account with that name already exists",
                    }
                ),
                404,
            )
        else:

            tempquery = "SELECT id FROM roles WHERE role = ?"
            cursor.execute(tempquery, (role,))
            res = cursor.fetchone()
            roleID = res[0]

            query = """
                INSERT INTO users (username, password, role_id,email, fullName)   
                VALUES (?, ?, ?, ?, ?)"""

            cursor.execute(query, (username, password, roleID, email, fullName))

            sqlConn.commit()

            cursor.close()

            return (
                jsonify(
                    {"messagetype": "Valid", "message": "Account created successfully"}
                ),
                200,
            )

    except sqlite3.Error as error:
        return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


#get all users data for the users table
@app.route("/getUserData", methods=["GET"])
@token_required
def getuserdata(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    sqlConn = None
    try:

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()  # executes sql commands

        query = """SELECT s.id,s.username,s.email,s.password,s.fullName, r.role
                    FROM users s
                    JOIN roles r 
                    ON s.role_id = r.id
                    ORDER BY s.id ASC
                """

        cursor.execute(query)

        result = cursor.fetchall()

        user_id = []
        usernames = []
        emails = []
        passwords = []
        fullNames = []
        roles = []

        for row in result:
            user_id.append(row[0])
            usernames.append(row[1])
            emails.append(row[2])
            passwords.append(row[3])
            fullNames.append(row[4])
            roles.append(row[5])

        userdata = {
            "id": user_id,
            "usernames": usernames,
            "passwords": passwords,
            "fullnames": fullNames,
            "emails": emails,
            "roles": roles,
        }

        return jsonify(userdata)

    except sqlite3.Error as error:
        return jsonify({"message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


@app.route("/getChosenUserData", methods=["GET"])
@token_required
def chosenUserManager(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    sqlConn = None
    try:
        user_id = request.args.get("id")

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor() 

        query = " SELECT u.username,u.password,u.email,u.fullName, r.role FROM users u JOIN roles r ON u.role_id  = r.id WHERE u.id = ?"

        cursor.execute(query, (user_id,))

        result = cursor.fetchone()

        if result is None:

            return (
                jsonify(
                    {
                        "messagetype": "Error",
                        "message": f"User with ID: {user_id} couldnt be found"
                    }
                ),
                404,
            )

        userName = result[0]
        userPass = result[1]
        userEmail = result[2]
        userFullName = result[3]


        userData = {
            "username": userName,
            "password": userPass,
            "email": userEmail,
            "fullName" : userFullName
        }

        return jsonify(userData)

    except sqlite3.Error as error:
        return jsonify({"message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()

    






@app.route("/edituser", methods=["POST"])
@token_required
def editUserManager(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    sqlConn = None
    try:
        data = request.get_json()
        userid = data.get("id")
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")
        role = data.get("role")

        if not username or not password or not email or not fullName or not role:
            return jsonify({"messagetype": "Error", "message": "Missing Input"}), 404

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()  # executes sql commands

        tempquery = "SELECT id FROM roles WHERE role = ?"
        cursor.execute(tempquery, (role,))
        res = cursor.fetchone()
        roleID = res[0]

        query = """
            UPDATE users SET username = ?, password = ?, email = ?, fullName = ?, role_id = ?
            WHERE id = ?"""

        cursor.execute(query, (username, password, email, fullName, roleID, userid))

        sqlConn.commit()

        cursor.close()

        return (
            jsonify(
                {"messagetype": "Valid", "message": "Account updated successfully"}
            ),
            200,
        )

    except sqlite3.Error as error:
        return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()



@app.route("/deleteuser", methods=["POST"])
@token_required
def deleteUserManager(username,role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    

    sqlConn = None
    try:

        data = request.get_json()
        userid = data.get("id")

        sqlConn = sqlite3.connect(db_path)
        cursor = sqlConn.cursor()  # executes sql commands

        query = """
            DELETE FROM users WHERE id = ?"""

        cursor.execute(query, (userid,))

        sqlConn.commit()

        cursor.close()

        return jsonify({"messagetype": "Success", "message": "User deleted."}), 200

    except sqlite3.Error as error:
        return jsonify({"messagetype": "Error", "message": str(error)}), 404

    finally:

        if sqlConn:
            sqlConn.close()


if __name__ == "__main__":
    app.run(debug=True, port=8001)
