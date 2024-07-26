from flask import *
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from werkzeug.utils import secure_filename
import gridfs
from bson import ObjectId

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
comments_collection = mydb['comments']
shares_collection = mydb['shares']
followers_collection = mydb['followers']
projects_collection = mydb['projects']
fs = gridfs.GridFS(mydb)


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

# Route to show comments for a specific post
@home.route('/<post_id>/comments')
def show_comments(post_id):
    comments = comments_collection.find({'post_id': post_id})  # Find comments for the given post ID
    users_that_commented = []
    for comment in comments:
        comment['_id'] = str(comment['_id'])  # Convert ObjectId to string for JSON serialization
        user = users_collection.find_one({'email': comment['commenter']})  # Find the user who commented
        if user:
            user['_id'] = ''  # Remove the '_id' field from the user document
            users_that_commented.append({'user': user, 'comment': comment})  # Add the user and comment to the list
    print(users_that_commented)
    return jsonify({'users': users_that_commented})  # Return the list of users who commented as JSON


@home.route('/<post_id>/shares')
def show_shares(post_id):
    shares = shares_collection.find({'post_id': post_id}) # Find shares for the given post ID
    users_that_shared = []
    for share in shares:
        share['_id'] = str(share['_id']) # Convert ObjectId to string for JSON serialization
        user = users_collection.find_one({'email': share['sharer']}) # Find the user who shared the post
        if user:
            user['_id'] = ''  # Remove the '_id' field from the user document
            users_that_shared.append({'user': user, 'share': share})  # Add the user to the list
        print(users_that_shared)
    return jsonify({'users': users_that_shared})


# Define route to create a new post
@home.route('/create_post', methods=['POST'])
def create_post():
    if request.method == "POST":
        post = request.get_json()  # Get the JSON data from the request
        insertion = posts_collection.insert_one(post)  # Insert the new post into the database
        inserted_id = insertion.inserted_id  # Get the inserted post's ID
        response = {'status': 'Success', 'id': str(inserted_id)}  # Prepare the response
        return jsonify(response)  # Return the response as JSON


@home.route('/show_posts')  # NEED TO CHANGE WHEN IMPLEMENTING FOLLOWERS
def show_posts():
    page = int(request.args.get('page', 1))  # Get the page number from the request, default to 1 if not provided
    per_page = 2  # Number of posts to show per page
    skip = (page - 1) * per_page  # Calculate the number of posts to skip based on the page number
    follows = list(followers_collection.find({'follower': session.get('user')['email']}))
    followees = [f['followee'] for f in follows]
    owners = followees + [session.get('user')['email']]
    query = {'owner': {'$in': owners}}
    posts_to_show = posts_collection.find(query).sort('DT', -1).skip(skip).limit(
        per_page)
    posts_list = list(posts_to_show)  # Convert the cursor to a list of dictionaries
    for post in posts_list:
        post['_id'] = str(post['_id'])  # Convert ObjectId to string for JSON serialization
        post['user'] = users_collection.find_one({'email': post['owner']})
        post['user']['_id'] = str(post['user']['_id'])
        post['likes'] = likes_collection.count_documents(
            {'post_id': post['_id']})  # Count the number of likes for the post
        post['comments'] = comments_collection.count_documents({'post_id': post['_id']})
        post['shares'] = shares_collection.count_documents({'post_id': post['_id']})
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


@home.route('/create_comment', methods=['POST'])
def create_comment():
    if request.method == "POST":
        active_user = session.get('user') # Get the current user's session data
        data = request.get_json() # Get the JSON data from the request
        post_id = data['id'] # Get the post ID from the data
        comment = data['comment'] # Get the comment text from the data
        new_comment = {'post_id': post_id, 'commenter': active_user['email'], 'comment': comment, 'DT': data['DT']} # Create a new comment
        comments_collection.insert_one(new_comment) # Insert the new comment into the database
        count = comments_collection.count_documents({'post_id': post_id}) # Count the number of comments for the post
        response = {'status': 'Added', 'comment': comment, 'amount': count} # Prepare the response
        return jsonify(response)


@home.route('/create_share', methods=['POST'])
def create_share():
    if request.method == "POST":
        active_user = session.get('user')
        data = request.get_json()
        html = data['shared']  # Get the post ID from the data
        post_id = data['shared_post_id']
        new_share = {'shared': html, 'post_id': post_id, 'sharer': active_user['email']}
        insertion = shares_collection.insert_one(new_share)
        response = {'status': 'Added', 'share_id': str(insertion.inserted_id)}
        return jsonify(response)


@home.route('/submit_project', methods=['POST'])
def submit_project():
    title = request.form['title']
    description = request.form['description']
    file_id = None
    photo_id = None

    # Handle file upload
    file = request.files.get('file')
    photo = request.files.get('photo')

    if file:
        filename = secure_filename(file.filename)
        file_id = fs.put(file, filename=filename)

    if photo:
        photo_filename = secure_filename(photo.filename)
        photo_id = fs.put(photo, filename=photo_filename)

    # Save description and file IDs to MongoDB
    project_data = {
        'owner': session.get('user')['email'],
        'title': title,
        'description': description,
        'file_id': file_id,
        'photo_id': photo_id
    }
    project = projects_collection.insert_one(project_data)
    project_id = str(project.inserted_id)
    return jsonify({'success': True, 'title': title, 'photo_id': str(photo_id), 'project_id': project_id})


@home.route('/get_image/<photo_id>', methods=['GET'])
def get_image(photo_id):
    try:
        photo_id = ObjectId(photo_id)  # Ensure photo_id is an ObjectId
        photo = fs.get(photo_id) # Ensure photo_id is an ObjectId
        content_type = photo.content_type if photo.content_type else 'application/octet-stream' # Determine the content type
        return send_file(photo, mimetype=content_type, download_name=photo.filename) # Send the file
    except Exception as e:
        print(f'Error fetching image: {str(e)}')
        return jsonify({'success': False, 'error': str(e)})


@home.route('/get_project/<project_id>', methods=['GET'])
def get_project(project_id):
    project = projects_collection.find_one({'_id': ObjectId(project_id)})
    print(project)
    project['_id'] = str(project['_id'])
    project['project_id'] = str(project['_id'])
    project['file_id'] = str(project['file_id'])
    project['photo_id'] = str(project['photo_id'])

    return jsonify({'success': True, 'project': project})

@home.route('/upload_image', methods=['POST'])
def upload_image():
    photo_id = None
    photo = request.files.get('file')
    if photo:
        photo_filename = secure_filename(photo.filename)
        photo_id = fs.put(photo, filename=photo_filename)
        return jsonify({'success': True, 'photo_id': str(photo_id)})
    else:
        return jsonify({'success': False})