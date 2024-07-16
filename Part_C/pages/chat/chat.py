from bson.json_util import dumps
from flask import Blueprint, render_template, request, jsonify, session
import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.json_util import loads


# About blueprint definition
chat = Blueprint(
    'chat',
    __name__,
    static_folder='static',
    static_url_path='/chat',
    template_folder='templates'
)

# MongoDB setup
uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
users_collection = mydb['users']
project_collection = mydb['projects']
messages_collection = mydb['messages']

# Routes
@chat.route('/chatt/<user_email>/<profile_email>')
def index(user_email, profile_email):
    user_data = users_collection.find_one({'email': profile_email})

    if user_data:
        user_id = user_data['_id']
        first_name = user_data.get('first_name')
        last_name = user_data.get('last_name')
        user_name = f"{first_name} {last_name}"
        user_role = user_data.get('role', '')
        user_picture = user_data.get('profile_picture', '')

        return render_template('chat.html', user_email=user_email, profile_email=profile_email,
                               user_name=user_name, user_role=user_role, user_picture=user_picture, user_id=user_id)
    else:
        return "User not found", 404

@chat.route('/send_message', methods=['POST'])
def send_message():
    data = request.get_json()
    sender_email = data.get('sender_email')
    receiver_email = data.get('receiver_email')
    message = data.get('message')
    timestamp = data.get('timestamp')
    files = data.get('files', [])

    if not sender_email or not receiver_email or not message:
        return jsonify({'error': 'Missing required fields'}), 400

    # Save the message to the database
    messages_collection.insert_one({
        'sender_email': sender_email,
        'receiver_email': receiver_email,
        'message': message,
        'timestamp': timestamp,
        'files': files
    })

    return jsonify({'success': True}), 200

@chat.route('/get_messages/<sender_email>/<receiver_email>', methods=['GET'])
def get_messages(sender_email, receiver_email):
    # Fetch messages from the database
    messages = list(messages_collection.find({
        '$or': [
            {'sender_email': sender_email, 'receiver_email': receiver_email},
            {'sender_email': receiver_email, 'receiver_email': sender_email}
        ]
    }).sort('timestamp'))

    return jsonify({'messages': messages})
