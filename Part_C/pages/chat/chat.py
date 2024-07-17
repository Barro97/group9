from bson.json_util import dumps
from flask import Blueprint, render_template, request, jsonify, send_from_directory, session
import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from flask import redirect, url_for

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

# Configuration
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx'}

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@chat.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


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
    message = request.form.get('message', '')
    file = request.files.get('file')
    timestamp = datetime.now()

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        file_extension = filename.rsplit('.', 1)[1].lower()
        if file_extension in {'png', 'jpg', 'jpeg', 'gif'}:
            message = f"<img src='/uploads/{filename}' alt='{filename}' style='max-width: 200px; max-height: 200px;'>"
        else:
            message = f"<a href='/uploads/{filename}' target='_blank'>{filename}</a>"

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


@chat.route('/latest_chats/<user_email>', methods=['GET'])
def latest_chats(user_email):
    # Fetch distinct user emails involved in chats with the given user
    pipeline = [
        {
            '$match': {
                '$or': [
                    {'sender_email': user_email},
                    {'recipient_email': user_email}
                ]
            }
        },
        {
            '$group': {
                '_id': {'$cond': [{'$eq': ['$sender_email', user_email]}, '$recipient_email', '$sender_email']},
                'last_message': {'$max': '$timestamp'}
            }
        },
        {
            '$sort': {'last_message': -1}
        }
    ]

    chat_users = list(messages_collection.aggregate(pipeline))
    latest_chats = []

    for chat_user in chat_users:
        user_data = users_collection.find_one({'email': chat_user['_id']})
        if user_data:
            latest_chats.append({
                'email': user_data['email'],
                'first_name': user_data.get('first_name', ''),
                'last_name': user_data.get('last_name', ''),
                'role': user_data.get('role', ''),
                'profile_picture': user_data.get('profile_picture', '')
            })

    return jsonify({'latest_chats': latest_chats})


@chat.route('/latest_chat')
def latest_chat():
    user = session.get('user')

    if not user:
        return redirect(url_for('login.check_user'))  # Redirect to login if the user is not logged in

    user_email = user['email']

    pipeline = [
        {
            '$match': {
                '$or': [
                    {'sender_email': user_email},
                    {'recipient_email': user_email}
                ]
            }
        },
        {
            '$group': {
                '_id': {'$cond': [{'$eq': ['$sender_email', user_email]}, '$recipient_email', '$sender_email']},
                'last_message': {'$max': '$timestamp'}
            }
        },
        {
            '$sort': {'last_message': -1}
        },
        {
            '$limit': 1
        }
    ]

    latest_chat_user = list(messages_collection.aggregate(pipeline))

    if latest_chat_user:
        profile_email = latest_chat_user[0]['_id']
        return redirect(url_for('chat.index', user_email=user_email, profile_email=profile_email))
    else:
        return redirect(url_for('chat.index', user_email=user_email, profile_email=user_email))

