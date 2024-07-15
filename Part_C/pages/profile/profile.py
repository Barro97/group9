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


@profile.route('/profile/<user_email>')
def view_profile(user_email):
    print(user_email, session.get('user')['email'])
    if session.get('user')['email'] == user_email:
        return redirect(url_for('my_profile.index'))
    else:
        user = users_collection.find_one({'email': user_email})
        if user:
            session['profile_owner'] = user_email
            projects = project_collection.find({'owner': user_email})
            count = followers_collection.count_documents({'followee': session.get('profile_owner')})
            return render_template('profile.html', user=user, projects=projects, count=count)
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
