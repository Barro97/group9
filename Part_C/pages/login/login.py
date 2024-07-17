# from urllib import request

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo
from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session

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


@login.route('/check_user', methods=['GET', 'POST'])  # The route for verifying the user
def check_user():
    if request.method == 'POST':
        data = request.json  # Get the form data from the JS
        email = data.get('email')
        password = data.get('password')

        query = {"email": email, "password": password}
        user = users_collection.find_one(query)  # Try to find the user that was input in the DB
        print(user)
        if user:
            user['_id']=str(user['_id'])
            session['user'] = user  # Save the current user
            session['logged_in'] = True  # A boolean for page interaction
            return jsonify({"success": True, "redirect": "/home"})  # A JSON for successful log in attempt
        else:
            return jsonify(
                {"success": False, "message": "Invalid email or password."})  # A JSON for failed log in attempt
