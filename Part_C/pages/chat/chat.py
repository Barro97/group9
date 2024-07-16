from bson.json_util import dumps
from flask import Blueprint, render_template, request, jsonify, session
import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.json_util import loads
import datetime
from datetime import datetime



# Blueprint definition
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

        # Fetch messages between the two users
        messages = messages_collection.find({
            '$or': [
                {'sender_email': user_email, 'recipient_email': profile_email},
                {'sender_email': profile_email, 'recipient_email': user_email}
            ]
        }).sort('timestamp')

        messages = list(messages)  # Convert cursor to list
        for message in messages:
            message['_id'] = str(message['_id'])  # Convert ObjectId to string

        return render_template('chat.html', user_email=user_email, profile_email=profile_email,
                               user_name=user_name, user_role=user_role, user_picture=user_picture, user_id=user_id,
                               messages=messages)
    else:
        return "User not found", 404


@chat.route('/send_message', methods=['POST'])
def send_message():
    sender_email = request.form['sender_email']
    receiver_email = request.form['receiver_email']
    message = request.form['message']
    timestamp = datetime.now()

    message_data = {
        'sender_email': sender_email,
        'recipient_email': receiver_email,
        'message': message,
        'timestamp': timestamp
    }

    messages_collection.insert_one(message_data)
    return jsonify({'status': 'Message sent successfully!'})

@chat.route('/fetch_messages')
def fetch_messages():
    user_email = request.args.get('user_email')
    profile_email = request.args.get('profile_email')

    messages = messages_collection.find({
        '$or': [
            {'sender_email': user_email, 'recipient_email': profile_email},
            {'sender_email': profile_email, 'recipient_email': user_email}
        ]
    }).sort('timestamp')

    messages = list(messages)  # Convert cursor to list
    for message in messages:
        message['_id'] = str(message['_id'])  # Convert ObjectId to string

    return jsonify({'messages': messages})
