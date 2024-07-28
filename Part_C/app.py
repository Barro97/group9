from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from flask import *

app = Flask(__name__)
app.secret_key = '123'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

from pages.aboutus.aboutus import about_us

app.register_blueprint(about_us)

from pages.login.login import login

app.register_blueprint(login)

from pages.chat.chat import chat

app.register_blueprint(chat)

from pages.home.home import home

app.register_blueprint(home)

from pages.myprofile.my_profile import my_profile

app.register_blueprint(my_profile)



from pages.organization.organization import organization

app.register_blueprint(organization)

from pages.privacypolicy.privacy_policy import privacy_policy

app.register_blueprint(privacy_policy)

from pages.profile.profile import profile

app.register_blueprint(profile)

from pages.project.project import project

app.register_blueprint(project)

from pages.searchresults.search_results import search_results

app.register_blueprint(search_results)

from pages.signup.signup import signup

app.register_blueprint(signup)


@app.route('/')
def home():
    return redirect(url_for('login.index'))


if __name__ == '__main__':
    app.run(debug=True)

uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
users_collection = mydb['users']
messages_collection = mydb['messages']


# @app.route('/MongoDB')
# def MongoDB_func():
#     name = 'Rina'

@app.route('/follow', methods=['POST'])
def follow():
    follower_id = request.json['follower_id']
    followee_id = request.json['followee_id']

    # Update follower count for followee
    users_collection.update_one({'_id': followee_id}, {'$inc': {'followers': 1}})

    # Add follower to followee's followers list (if required)
    # users_collection.update_one({'_id': followee_id}, {'$addToSet': {'followers_list': follower_id}})

    return jsonify({'status': 'success'})


@app.route('/unfollow', methods=['POST'])
def unfollow():
    follower_id = request.json['follower_id']
    followee_id = request.json['followee_id']

    # Update follower count for followee
    users_collection.update_one({'_id': followee_id}, {'$inc': {'followers': -1}})

    # Remove follower from followee's followers list (if required)
    # users_collection.update_one({'_id': followee_id}, {'$pull': {'followers_list': follower_id}})

    return jsonify({'status': 'success'})


if __name__ == '__main__':
    app.run(debug=True)

