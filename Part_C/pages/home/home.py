from flask import *
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# about blueprint definition
home = Blueprint(
    'home',
    __name__,
    static_folder='static',
    static_url_path='/home',
    template_folder='templates'
)

uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
posts_collection = mydb['posts']
likes_collection = mydb['likes']
users_collection = mydb['users']


# Routes
@home.route('/home')
def index():
    return render_template('home.html')


@home.route('/user', methods=['GET', 'POST'])
def user():
    return jsonify({"user": session.get('user')})


@home.route('/<post_id>/likes')
def show_likes(post_id):
    print(post_id)
    likes = likes_collection.find({'post_id': post_id})
    users_that_liked = []
    for like in likes:
        user = users_collection.find_one({'email': like['liker']})
        if user:
            user['_id']=''
            print(user)
            users_that_liked.append(user)
    print(users_that_liked)
    return jsonify({'users': users_that_liked})


@home.route('/create_post', methods=['POST'])
def create_post():
    if request.method == "POST":
        post = request.get_json()
        insertion = posts_collection.insert_one(post)
        inserted_id = insertion.inserted_id
        response = {'status': 'Success', 'id': str(inserted_id)}
        return jsonify(response)


@home.route('/create_like', methods=['POST'])
def create_like():
    if request.method == "POST":
        active_user = session.get('user')
        data = request.get_json()
        post_id = data['id']
        query = {"post_id": post_id, "liker": active_user['email']}
        like = likes_collection.find_one(query)
        if like:
            likes_collection.delete_one(like)
            status = 'Removed'
        else:
            new_like = {'liker': active_user['email'], "post_id": post_id, 'DT': data['DT']}
            likes_collection.insert_one(new_like)
            status = 'Added'

        count = likes_collection.count_documents({'post_id': post_id})
        response = {'status': status, 'liker': active_user, 'amount': count}
        return jsonify(response)
