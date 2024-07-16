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
experience_collection = mydb['experience']
education_collection = mydb['education']
org_collection = mydb['organizations']


@profile.route('/profile/<user_email>')
def view_profile(user_email):
    user = users_collection.find_one({'email': user_email})
    if user:
        projects = list(project_collection.find({'owner': user_email}))
        experiences = list(experience_collection.find({'user_email': user_email}))
        educations = list(education_collection.find({'user_email': user_email}))

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

        return render_template('profile.html', user=user, projects=projects, experiences=experiences, educations=educations)
    else:
        return "User not found", 404
