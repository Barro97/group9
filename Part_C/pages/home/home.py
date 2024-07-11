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

# Define route for the home page
@home.route('/home')
def index():
    return render_template('home.html')


# Define route to get user information
@home.route('/user', methods=['GET', 'POST'])
def user():
    return jsonify({"user": session.get('user')})  # Return the current user's session data as JSON


# Define route to show likes for a specific post
@home.route('/<post_id>/likes')
def show_likes(post_id):
    likes = likes_collection.find({'post_id': post_id})  # Find likes for the given post ID
    users_that_liked = []
    for like in likes:
        user = users_collection.find_one({'email': like['liker']})  # Find the user who liked the post
        if user:
            user['_id'] = ''  # Remove the '_id' field from the user document
            users_that_liked.append(user)  # Add the user to the list
    return jsonify({'users': users_that_liked})  # Return the list of users who liked the post as JSON


# Define route to create a new post
@home.route('/create_post', methods=['POST'])
def create_post():
    if request.method == "POST":
        post = request.get_json()  # Get the JSON data from the request
        insertion = posts_collection.insert_one(post)  # Insert the new post into the database
        inserted_id = insertion.inserted_id  # Get the inserted post's ID
        response = {'status': 'Success', 'id': str(inserted_id)}  # Prepare the response
        return jsonify(response)  # Return the response as JSON


@home.route('/show_posts')
def show_posts():
    page = int(request.args.get('page', 1))  # Get the page number from the request, default to 1 if not provided
    per_page = 2  # Number of posts to show per page
    skip = (page - 1) * per_page  # Calculate the number of posts to skip based on the page number

    posts_to_show = posts_collection.find({'owner': session.get('user')['email']}).skip(skip).limit(per_page)
    posts_list = list(posts_to_show)  # Convert the cursor to a list of dictionaries
    for post in posts_list:
        post['_id'] = str(post['_id'])  # Convert ObjectId to string for JSON serialization
        post['user'] = users_collection.find_one({'email': post['owner']})
        post['user']['_id'] = str(post['user']['_id'])
        post['likes'] = likes_collection.count_documents({'post_id': post['_id']})  # Count the number of likes for the post

    return jsonify({'posts': posts_list})


# Define route to create or remove a like
@home.route('/create_like', methods=['POST'])
def create_like():
    if request.method == "POST":
        active_user = session.get('user')  # Get the current user's session data
        data = request.get_json()  # Get the JSON data from the request
        post_id = data['id']  # Get the post ID from the data
        query = {"post_id": post_id, "liker": active_user['email']}  # Prepare the query to find the like
        like = likes_collection.find_one(query)  # Find if the like already exists
        if like:
            likes_collection.delete_one(like)  # Remove the like if it exists
            status = 'Removed'
        else:
            new_like = {'liker': active_user['email'], "post_id": post_id, 'DT': data['DT']}  # Create a new like
            likes_collection.insert_one(new_like)  # Insert the new like into the database
            status = 'Added'

        count = likes_collection.count_documents({'post_id': post_id})  # Count the number of likes for the post
        response = {'status': status, 'liker': active_user, 'amount': count}  # Prepare the response
        return jsonify(response)
