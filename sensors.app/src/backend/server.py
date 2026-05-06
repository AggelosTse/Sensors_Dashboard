from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from functools import wraps
import jwt
from dotenv import load_dotenv
import os
import sys
import re
import bcrypt
from datetime import datetime, timedelta

from sqlalchemy import func

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.database import db, User,Role,SensorCategory,Sensor,Measurement

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
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
            "iat": datetime.now(datetime.timezone.utc),
            "exp": datetime.now(datetime.timezone.utc) + timedelta(hours=1),
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
            
        role_to_assign = db.session.execute(
                db.select(Role).filter_by(name=role)
            ).scalar_one_or_none()  
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        new_user = User(
                username=username,
                password=hashed_password,
                email=email,
                role=role_to_assign
            )
        
        db.session.add(new_user)
        db.session.commit()
            
        payload = {
                "exp": datetime.datetime.now(datetime.timezone.utc)
                + datetime.timedelta(hours=1),
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
        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=8001)