from flask import Blueprint, render_template, session, redirect, url_for, request
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId

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
experience_collection = mydb['experience']
education_collection = mydb['education']
org_collection = mydb['organizations']


# Routes
@my_profile.route('/my_profile')
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login.index'))

    user = session.get('user', {})
    email = user.get('email')
    first_name = user.get('first_name')
    last_name = user.get('last_name')
    full_name = f"{first_name} {last_name}"
    role = user.get('role')
    profile_picture = user.get('profile_picture')
    followers = user.get('followers', 0)  # You can set a default value or fetch it from DB
    linkedin = user.get('linkedin')
    github = user.get('github')
    facebook = user.get('facebook')
    about_me = user.get('about_me')

    projects = list(project_collection.find({'owner': email}))
    experiences = list(experience_collection.find({'user_email': email}))
    educations = list(education_collection.find({'user_email': email}))

    # Fetch logos for experiences
    for exp in experiences:
        org = mydb['organizations'].find_one({'org_name': exp['org_name']})
        if org:
            exp['logo'] = org.get('logo', '')

    # Fetch logos for educations
    for edu in educations:
        org = mydb['organizations'].find_one({'org_name': edu['org_name']})
        if org:
            edu['logo'] = org.get('logo', '')

    return render_template('my profile.html', full_name=full_name, role=role, followers=followers, profile_picture=profile_picture, linkedin=linkedin, github=github, facebook=facebook, about_me=about_me, projects=projects, experiences=experiences, educations=educations)