from flask import Blueprint, render_template, request
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId

profile = Blueprint(
    'profile',
    __name__,
    static_folder='static',
    static_url_path='/profile',
    template_folder='templates'
)

# MongoDB setup
uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
users_collection = mydb['users']
project_collection = mydb['projects']

@profile.route('/profile/<user_id>')
def view_profile(user_id):
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    if user:
        projects = project_collection.find({'owner': user_id})
        return render_template('profile.html', user=user, projects=projects)
    else:
        return "User not found", 404

    # @profile.route('/chatpr/<user_email>/<profile_email>')
    # def chat(user_email, profile_email):
    #     return render_template('chat.html', user_email=user_email, profile_email=profile_email)