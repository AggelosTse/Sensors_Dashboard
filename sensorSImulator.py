from flask import Flask, request, jsonify
import random
import time 
import sqlite3
import os




base_dir = os.path.dirname(os.path.abspath(__file__))

db_path = os.path.join(base_dir, 'sensors.app', 'src', 'backend','database', 'sensorsDashBoard.db')

sqlConn = None


sqlConn = sqlite3.connect(db_path)
cursor = sqlConn.cursor() 

#get all sensor data 
query = '''
        SELECT s.id, c.category 
        FROM sensors s 
        JOIN sensor_categories c ON s.category_id = c.id
    '''    
cursor.execute(query)

result = cursor.fetchall()
    
sensorIDs = []
sensorCategories = []

for row in result:
    sensorIDs.append(row[0])
    sensorCategories.append(row[1])

while True:
    randomSensorIndex = random.randrange(1,len(sensorIDs))
    
    currentSensorID = sensorIDs[randomSensorIndex]
    currentSensorCategory = sensorCategories[randomSensorIndex]
    
    
    if currentSensorCategory == "Humidity":
        randomValue = random.randrange(0,100)
    elif currentSensorCategory == "Temperature":
        randomValue = random.randrange(-50,100)
    
    timestamp = time.time()
    
    query = 'INSERT INTO measurements (value, timestamp, sensor_id) VALUES(?,?,?)'
    
    cursor.execute(query,(randomValue,timestamp,currentSensorID))
    
    sqlConn.commit() 
    
    time.sleep(5)