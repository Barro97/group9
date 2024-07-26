# from urllib import request

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo
from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session
from datetime import timedelta
from app import app  # Import app from your main application module



# about blueprint definition
login = Blueprint(
    'login',
    __name__,
    static_folder='static',
    static_url_path='/login',
    template_folder='templates'
)

# MongoDB setup
uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
users_collection = mydb['users']


# Routes
@login.route('/login')
def index():
    session['logged_in'] = False  # So the nav-bar doesn't show up for users who are not logged in
    session['user'] = ''  # Remove user
    return render_template('login.html')


@login.route('/check_user', methods=['GET', 'POST'])
def check_user():
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        password = data.get('password')
        remember_me = data.get('remember-me')  # Get the remember-me value from the form data

        query = {"email": email, "password": password}
        user = users_collection.find_one(query)
        if user:
            session['user'] = user
            user.pop('_id', None)
            session['logged_in'] = True

            if remember_me:
                session.permanent = True  # Make the session permanent
                app.permanent_session_lifetime = timedelta(days=30)  # Set the session to last 30 days
            else:
                session.permanent = False  # Session will expire when the browser is closed

            return jsonify({"success": True, "redirect": "/home"})
        else:
            return jsonify({"success": False, "message": "Invalid email or password."})
