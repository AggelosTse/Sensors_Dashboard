import requests
import random
import time 
import os
import sys
from flask import Flask
from dotenv import load_dotenv
from datetime import datetime

#go to root
base_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(base_dir, '..', '..', '..')) 

#go to src
src_path = os.path.join(root_dir, 'sensors.app', 'src')
sys.path.append(src_path)

from database.databaseModels import db, Sensor

load_dotenv()

app = Flask(__name__)

#database url from env file
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

def login():
    logindata = {
        "username" : "aggelos",
        "password" : "aggelosaggelos"
    } 
    try:

        res = requests.post("http://localhost:8001/loginValidation",json=logindata)
        if(res.status_code == 200):
            print("logged in!")
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
            
            
            if sensorCategory == "Humidity":
                randomValue = random.randrange(0,100)
            elif sensorCategory == "Temperature":
                randomValue = random.randrange(-50,100)
            
            timestamp = time.time()
            current_time = datetime.fromtimestamp(timestamp)
            
            sensorNewData = {
                    "sensorID" : randomSensor.id,
                    "sensorValue" : randomValue,
                    "timestamp" : current_time.isoformat()
                }
            headers = {"Authorization": f"Bearer {token}"}
            try:

                res = requests.post("http://localhost:8001/sensorNewDataStore",json= sensorNewData, headers=headers)
                print(str(res))
            except Exception as error:
                    print(error)

            time.sleep(15)
        
    
if __name__ == "__main__":
    token = login()
    simulate(token)