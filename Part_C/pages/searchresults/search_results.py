from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo
from flask import Blueprint, render_template, request, redirect, url_for
from pymongo import MongoClient

# about blueprint definition
search_results = Blueprint(
    'search_results',
    __name__,
    static_folder='static',
    static_url_path='/search_results',
    template_folder='templates'
)


# MongoDB setup
uri = ("mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/"
       "?retryWrites=true&w=majority&appName=Workfolio")
myclient = MongoClient(uri, server_api=ServerApi('1'))

mydb = myclient['user_database']
users_collection = mydb['users']

# Routes
@search_results.route('/search_results')
def index():
    myquery = {"first_name": "sfs"}
    mydoc=list(users_collection.find(myquery))
    return render_template('search_results.html', mydoc=mydoc)
