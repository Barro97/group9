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
followers_collection = mydb['followers']
profile_owner = ''

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

@profile.route('/follow')
def follow():
    followers_collection.insert_one({'follower': session.get('user')['email'], 'followee': session.get('profile_owner')})
    count = followers_collection.count_documents({'followee': session.get('profile_owner')})
    return jsonify({'status': 'success', 'count': count})


@profile.route('/unfollow')
def unfollow():
    followers_collection.delete_one({'follower': session.get('user')['email'], 'followee': session.get('profile_owner')})
    return jsonify({'status': 'success'})


@profile.route('/check_for_following')
def check_for_following():
    isFollowing = followers_collection.find_one({'follower': session.get('user')['email'], 'followee': session.get('profile_owner')})
    if isFollowing:
        return jsonify({'isFollowing': True})
    else:
        return jsonify({'isFollowing': False})