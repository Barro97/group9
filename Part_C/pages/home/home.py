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


# Routes
@home.route('/home')
def index():
    return render_template('home.html')


@home.route('/user', methods=['GET', 'POST'])
def user():
    return jsonify({"user": session.get('user')})


@home.route('/create_post', methods=['POST'])
def create_post():
    if request.method == "POST":
        post = request.get_json()
        insertion = posts_collection.insert_one(post)
        inserted_id = insertion.inserted_id
        print(inserted_id)
        response = {'status': 'Success', 'id': str(inserted_id)}
        return jsonify(response)

# @home.route('/create_like', methods=['POST'])
# def create_like():
#     if request.method == "POST":
