import requests
import random
import time 
import os
import sys
from flask import Flask
from dotenv import load_dotenv
from datetime import datetime, timezone

#go to root
base_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(base_dir, '..', '..', '..')) 

#go to src
src_path = os.path.join(root_dir, 'sensors.app', 'src')
if src_path not in sys.path:
    sys.path.append(src_path)

#import db object for database 
from database.databaseModels import db, Sensor

load_dotenv()

app = Flask(__name__)

#database url from env file
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

def login():
    
    #creating and sending my account info 
    logindata = {
        "username" : "aggelos",
        "password" : "aggelos2004"
    } 
    try:
        res = requests.post("http://localhost:8001/loginValidation",json=logindata)
        
        #if server returns 200, im logged in 
        if(res.status_code == 200):
            data = res.json()
            token = data.get("token")
            
            return token
        else:
            print(str(res))
        
    except Exception as error:
            print(error)

def simulate(token):
    with app.app_context():
        
        #get all sensor data 
        sensors = sensors = db.session.query(Sensor).all()
    
        while True:
            #sensors is a tuple of sensor objects, this picks a random sensor object
            randomSensor = random.choice(sensors)
            
            #get the category from sensor object via their connection
            sensorCategory = randomSensor.category.category
            
            #create random measurement values to send
            if sensorCategory == "Humidity":
                randomValue = random.randrange(0,100)
            elif sensorCategory == "Temperature":
                randomValue = random.randrange(-50,100)
            
            #send the unix timestamp along side the measurements
            current_time = datetime.now(timezone.utc).timestamp()
            
            sensorNewData = {
                    "sensorID" : randomSensor.id,
                    "sensorValue" : randomValue,
                    "timestamp" : current_time
                }
            headers = {"Authorization": f"Bearer {token}"}
           
            try:
                #send them to the specific API endpoint
                res = requests.post("http://localhost:8001/sensorNewDataStore",json= sensorNewData, headers=headers)
                print(str(res))
            except Exception as error:
                    print(error)

            time.sleep(15)
        
    
if __name__ == "__main__":
    token = login()
    simulate(token)