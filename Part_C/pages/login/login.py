from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo
from flask import Blueprint, render_template

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
    return render_template('login.html')
