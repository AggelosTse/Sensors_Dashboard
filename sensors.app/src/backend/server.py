from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from functools import wraps
import jwt
from dotenv import load_dotenv
import os
import sys
import re
import bcrypt
from datetime import datetime, timedelta,timezone

from sqlalchemy import func

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.databaseModels import db, User,Role,SensorCategory,Sensor,Measurement

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"] 
)

load_dotenv()

#database url from env file
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["SECRET_KEY"] = "your_super_secret_safe_key"  #for the token 

db.init_app(app)

email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]

            token = auth_header.split(" ")[1] if " " in auth_header else auth_header

        if not token:
            return make_response(jsonify({"message": "A valid token is missing!"}), 401)

        try:

            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])

            current_user_username = data["username"]
            current_user_role = data["role"]
        except jwt.ExpiredSignatureError:
            return make_response(jsonify({"message": "Token has expired!"}), 401)
        except jwt.InvalidTokenError:
            return make_response(jsonify({"message": "Invalid token!"}), 401)
        except Exception as e:
            return make_response(jsonify({"message": str(e)}), 401)

        return f(current_user_username, current_user_role, *args, **kwargs)
    return decorator
#AUTH

@app.route("/loginValidation", methods=["POST"])
def loginManager():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({
                "messagetype": "Error", 
                "message": "Missing Input"
                }), 400
            
        user = db.session.execute(
            db.select(User).filter_by(username=username)
        ).scalar_one_or_none()
        
        if user is None or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({
                "messagetype": "Error", 
                "message": "Invalid username or Password"
                }),401
        
        role_name = user.role.name
        
        payload = {
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            "username": username,
            "role": role_name
        }

        token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")

        return jsonify({
            "messagetype": "Valid",
            "message": "Logging in",
            "role": role_name,
            "token": token
            }),200
        
    except Exception as error:
        print("LOGIN ", error)
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
        
@app.route("/signUp", methods=["POST"])
def signupManager():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")

        if not username or not password or not email or not fullName:
            return jsonify({
                "messagetype": "Error", 
                "message": "Missing Input"
                }), 400

        if(len(password) < 8):
            return jsonify({
                "messagetype": "Error", 
                "message": "Password not long enough (>8)"
                }), 422

        if not re.match(email_regex, email):
            return jsonify({
                "messagetype": "Error", 
                "message": "Invalid Email Format"
                }), 400
            
        existing_user = db.session.execute(
                db.select(User).filter_by(username=username)
            ).scalar_one_or_none()   
        
        if existing_user is not None:
                return jsonify({
                    "messagetype": "Error",
                    "message": "Account with that name already exists"
                    }),409   
                
        user_count = db.session.query(func.count(User.id)).scalar()
        
        if user_count == 0: role = "admin"
        else: role = "user"
            
        #contains the id to the specific role
        role_to_assign = db.session.execute(
                db.select(Role).filter_by(name=role)
            ).scalar_one_or_none()  
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        new_user = User(
                username=username,
                password=hashed_password,
                email=email,
                fullName=fullName,
                role=role_to_assign
            )
        
        db.session.add(new_user)
        db.session.commit()
            
        payload = {
                
                # Use timezone.utc directly since we imported it
                "iat": datetime.now(timezone.utc),
                "exp": datetime.now(timezone.utc) + timedelta(hours=1),
                "username": username,
                "role": role
            }

        token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")

        return jsonify({
            "messagetype": "Valid",
            "message": "Account Created Successfully",
            "role": role,
            "token": token
            }),201

    except Exception as error:
        print(error)
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
#SENSORS    

@app.route("/getSensorCategories", methods=["GET"])
@token_required
def sensorCategoriesManager(username, role):
    
    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    try:
        categories_query = db.session.execute(db.select(SensorCategory)).scalars().all()
        categories = [cat.category for cat in categories_query]
        return jsonify(categories), 200
    
    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
        
@app.route("/addsensor", methods=["POST"])
@token_required
def addSensorManager(username, role):
    
    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403

    try:
        data = request.get_json()
        sensorName = data.get("name")
        metadata = data.get("metadata")
        category_name = data.get("category")
        
        #returns category object {id, category}
        category = db.session.execute(
            db.select(SensorCategory).filter_by(category=category_name)
        ).scalar_one_or_none()

        new_sensor = Sensor(
            name=sensorName,
            metadata_info=metadata,
            category_id=category.id
        )

        db.session.add(new_sensor)
        db.session.commit()

        return jsonify({
                "messagetype": "Valid", 
                "message": "Sensor created successfully"
                }),201

    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500

@app.route("/getChosenSensorData", methods=["GET"])
@token_required
def chosenSensorManager(username, role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    try:
        sensor_id = request.args.get("id")
        
        sensor = db.session.execute(
            db.select(Sensor).filter_by(id=sensor_id)
        ).scalar_one_or_none()
    
        sensor_data = {
            "name": sensor.name,
            "category": sensor.category.category, 
            "metadata": sensor.metadata_info
        }
    
        return jsonify(sensor_data), 200

    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500


@app.route("/editSensor", methods=["POST"])
@token_required
def editSensorManager(username, role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403

    try:
        data = request.get_json()
        sensorID = data.get("id")
        sensorName = data.get("name")
        sensorCategory = data.get("category")
        sensorMetadata = data.get("metadata")
        
        sensor = db.session.get(Sensor, sensorID)

        category = db.session.execute(
            db.select(SensorCategory).filter_by(category=sensorCategory)
        ).scalar_one_or_none()

        sensor.name = sensorName
        sensor.metadata_info = sensorMetadata 
        sensor.category_id = category.id
        
        db.session.commit()
        
        return jsonify({
            "messagetype": "Valid", 
            "message": "Sensor updated successfully"
            }),200
        
    except Exception as error:
        print(error)
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
      
        
@app.route("/deletesensor", methods=["POST"])
@token_required
def deleteSensorManager(username, role): 
    
    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    try:
        data = request.get_json()
        sensorID = data.get("id")
        
        sensor = db.session.get(Sensor, sensorID)

        if sensor is None:
                return jsonify({
                    "messagetype": "Error",
                    "message": f"Sensor with ID: {sensorID} couldnt be found",
                    }),404
                
        db.session.delete(sensor)
        db.session.commit()
        
        return jsonify({
            "messagetype": "Valid", 
            "message": "Sensor deleted."
            }), 200

    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
@app.route("/getSensorsData", methods=["GET"])
@token_required
def getAllSensorsData(username, role):  

    try:
        sensors = db.session.execute(db.select(Sensor)).scalars().all()
        sensorIDs = [s.id for s in sensors]
        sensorNames = [s.name for s in sensors]
        sensorCategories = [s.category.category for s in sensors]
        
        sensorsSum = db.session.query(func.count(Sensor.id)).scalar()
        measurementsSum = db.session.query(func.count(Measurement.id)).scalar()
        
        averages = db.session.query(
            SensorCategory.category,
            func.avg(Measurement.value)
        ).select_from(SensorCategory) \
         .join(Sensor, SensorCategory.id == Sensor.category_id) \
         .join(Measurement, Sensor.id == Measurement.sensor_id) \
         .group_by(SensorCategory.category).all()
        
        averageValues = {name: round(val, 2) for name, val in averages}
                
        sensorData = {
            "sensorTable": {
                "id": sensorIDs,
                "names": sensorNames,
                "categories": sensorCategories
            },
            "sensorInfoStats": {
                "sumOfSensors": sensorsSum,
                "sumOfMeasurements": measurementsSum,
                "avgTemp": averageValues.get("Temperature", 0),
                "avgHumid": averageValues.get("Humidity", 0)
            }
        }

        return jsonify(sensorData), 200
        
    except Exception as error:
        print("getSensorsData ", error)
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
        

# measurements for a specific sensor (used for the more info graph)
@app.route("/getMeasurements", methods=["GET"])
@token_required
def getMeasurementsManager(username, role):
    try:
        sensorID = request.args.get("id")
        resolution = request.args.get("resolution","hour") #default hour
        
        truncated_time = func.date_trunc(resolution, Measurement.timestamp)

        measurements = db.session.execute(
            db.select(truncated_time.label("time"),
                func.avg(Measurement.value).label("average_value"))
            .where(Measurement.sensor_id == sensorID)
            .group_by(truncated_time) 
            .order_by(truncated_time.asc()) 
        ).all() 
        
        sensorData = {
            "timestamps": [row.time.isoformat() for row in measurements],
            "values": [round(float(row.average_value), 2) for row in measurements]
        }
        
        return jsonify(sensorData), 200

    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
        

#getting the new values from the sensor simulator script
@app.route("/sensorNewDataStore", methods=["POST"])
@token_required
def storeNewDataManager(username, role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403

    try:
        
        data = request.get_json()
        currentSensorID = data.get("sensorID")
        currentSensorValue = data.get("sensorValue")
        currentTimestamp = data.get("timestamp")

        new_measurement = Measurement(
            value=currentSensorValue,
            timestamp=datetime.fromisoformat(currentTimestamp.replace("Z", "+00:00")),
            sensor_id=currentSensorID
        ) 
    
        db.session.add(new_measurement)
        db.session.commit()
        
        return jsonify({
            "messagetype": "Valid", 
            "message": "Sensor new value stored Successfully"
            }),200

    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
        
#USERS

@app.route("/getUserRoles", methods=["GET"])
@token_required
def getRoles(username, role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
     
    try:
        roles = db.session.execute(db.select(Role)).scalars().all()
        if roles is not None:
            rolesList = [r.name for r in roles]
            return jsonify(rolesList), 200
        
        return jsonify({
            "messagetype": "Error", 
            "message": "No roles Found"
            }), 404

    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
        
        
@app.route("/adduser", methods=["POST"])
@token_required
def addUserManager(username, role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        fullName = data.get("fullName")
        role = data.get("role")
        
        if not username or not password or not email or not fullName or not role:
            return jsonify({
                "messagetype": "Error", 
                "message": "Missing Input"
                }), 400

        if(len(password) < 8):
            return jsonify({
                "messagetype": "Error", 
                "message": "Password not long enough (>8)"
                }), 422
        
        if not re.match(email_regex, email):
            return jsonify({
                "messagetype": "Error", 
                "message": "Invalid Email Format"
                }), 400
        
        existing_user = db.session.execute(
                db.select(User).filter_by(username=username)
            ).scalar_one_or_none()   
        
        if existing_user is not None:
                return jsonify({
                    "messagetype": "Error",
                    "message": "Account with that name already exists"
                    }),409   

        target_role = db.session.execute(
            db.select(Role).filter_by(name=data.get("role"))
        ).scalar_one_or_none()
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        new_user = User(
                username=username,
                password=hashed_password,
                email=email,
                fullName=fullName,
                role=target_role
            )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "messagetype": "Valid", 
            "message": "Account created successfully"
            }),201
        
    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
# get all users data for the users table
@app.route("/getUserData", methods=["GET"])
@token_required
def getuserdata(username, role):
    try:
        if role != "admin":
            return jsonify({"message": "Permission denied"}), 403   
        
        users = db.session.execute(
                db.select(User).order_by(User.id.asc())
            ).scalars().all()
        
        userdata = {
                "id": [u.id for u in users],
                "usernames": [u.username for u in users],
                "fullnames": [u.fullName for u in users], 
                "emails": [u.email for u in users],
                "roles": [u.role.name for u in users],
            }
        return jsonify(userdata),200

    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
@app.route("/getChosenUserData", methods=["GET"])
@token_required
def chosenUserManager(username, role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    try:
        user_id = request.args.get("id")
        
        user = db.session.get(User, user_id)
        
        if user is None:
            return jsonify({
                "messagetype": "Error",
                "message": f"Sensor with ID: {user_id} couldnt be found",
                }),404
    
        userData = {
            "username": user.username,
            "email": user.email,
            "fullName": user.fullName, 
            "role": user.role.name
        }
        
        return jsonify(userData),200

    except Exception as error:
        print("getChosenUserData", error)
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
@app.route("/edituser", methods=["POST"])
@token_required
def editUserManager(username, role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    try:
        data = request.get_json()
        userid = data.get("id")
        username = data.get("username")
        email = data.get("email")
        fullName = data.get("fullName")
        role = data.get("role")
        
        if not username or not email or not fullName or not role:
            return jsonify({
                "messagetype": "Error", 
                "message": "Missing Input"
                }), 400

        if not re.match(email_regex, email):
                    return jsonify({
                        "messagetype": "Error", 
                        "message": "Invalid Email Format"
                        }), 400
                    
        user = db.session.get(User, userid)
        
        if user is None:
                return jsonify({
                    "messagetype": "Error",
                    "message": f"Sensor with ID: {userid} couldnt be found",
                    }),404

        target_role = db.session.execute(
            db.select(Role).filter_by(name=role)
        ).scalar_one_or_none()
        
        user.username = username
        user.email = email
        user.fullName = fullName
        user.role = target_role 

        db.session.commit()
    
        return jsonify({
            "messagetype": "Valid", 
            "message": "Account updated successfully"
            }),200
        
    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
@app.route("/deleteuser", methods=["POST"])
@token_required
def deleteUserManager(username, role):

    if role != "admin":
        return jsonify({"message": "Permission denied"}), 403
    
    try:
        data = request.get_json()
        userid = data.get("id")
        
        user = db.session.get(User, userid)

        if user is None:
                return jsonify({
                    "messagetype": "Error",
                    "message": f"Sensor with ID: {userid} couldnt be found",
                    }),404
                
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            "messagetype": "Valid", 
            "message": "User deleted."
            }), 200

    except Exception as error:
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=8001)