from flask import *
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

@profile.route('/profile/<user_email>')
def view_profile(user_email):
    print(user_email,session.get('user')['email'])
    if session.get('user')['email'] == user_email:
        return redirect(url_for('my_profile.index'))
    else:
        user = users_collection.find_one({'email': user_email})
        if user:
            projects = project_collection.find({'owner': user_email})
            return render_template('profile.html', user=user, projects=projects)
        else:
            return "User not found", 404