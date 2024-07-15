from flask import Blueprint, render_template, session, redirect, url_for
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# about blueprint definition
my_profile = Blueprint(
    'my_profile',
    __name__,
    static_folder='static',
    static_url_path='/my_profile',
    template_folder='templates'
)

# MongoDB setup
uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
users_collection = mydb['users']
project_collection = mydb['projects']
followers_collection = mydb['followers']


# Routes
@my_profile.route('/my_profile')
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login.index'))

    user = session.get('user', {})
    projects = project_collection.find({'owner': user.get('email')})
    first_name = user.get('first_name')
    last_name = user.get('last_name')
    full_name = f"{first_name} {last_name}"
    linkedin = user.get('linkedin', 'https://www.linkedin.com/in/rina-klinchuk/')
    github = user.get('github', 'https://github.com/rinaklin')
    facebook = user.get('facebook', 'https://www.facebook.com/rina.klinchuk/')

    return render_template('my profile.html', full_name=full_name, role=user.get('role'),
                           profile_picture=user.get('profile_picture'), linkedin=linkedin, github=github,
                           facebook=facebook, about_me=user.get('about_me'), projects=projects)
