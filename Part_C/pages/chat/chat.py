from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo
from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session


# about blueprint definition
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
messages_collection = mydb['messages']

# Routes
@chat.route('/chat')
def index():
    return render_template('chat.html')

@chat.route('/send_message', methods=['POST'])
def send_message():
    data = request.get_json()
    message_text = data['message_text']
    user_name = data['user_name']
    timestamp = data['timestamp']
    files = data.get('files', [])

    # Save message to MongoDB
    message = {
        'user_name': user_name,
        'message_text': message_text,
        'timestamp': timestamp,
        'files': files
    }
    messages_collection.insert_one(message)
    return jsonify({'status': 'success'})

@chat.route('/get_messages', methods=['GET'])
def get_messages():
    user_name = request.args.get('user_name')
    messages = list(messages_collection.find({'user_name': user_name}))
    return jsonify(messages)
