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
@search_results.route('/search_results', methods=['GET'])
def index():
    query = request.args.get('query')
    if query:
        # Construct the query for MongoDB
        myquery = {"$or": [
            {"first_name": {"$regex": query, "$options": "i"}},
            {"last_name": {"$regex": query, "$options": "i"}},
            {"role": {"$regex": query, "$options": "i"}},

        ]}
    else:
        # If no query is provided, fetch all documents
        myquery = {}

    # Perform the query on the collection
    mydoc = list(users_collection.find(myquery))
    print(mydoc)

    return render_template('search_results.html', mydoc=mydoc, query=query)
