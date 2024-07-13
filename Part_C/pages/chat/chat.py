import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from flask import Blueprint, render_template, request, jsonify, session

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
users_collection = mydb['users']
project_collection = mydb['projects']

# Routes
@chat.route('/chatt/<user_email>/<profile_email>')
def index(user_email, profile_email):
    # Fetch user details from MongoDB based on profile_email
    user_data = users_collection.find_one({'email': profile_email})

    if user_data:
        # Extract relevant user details
        user_id= user_data['_id']
        first_name = user_data.get('first_name')
        last_name = user_data.get('last_name')
        user_name = f"{first_name} {last_name}"
        user_role = user_data.get('role', '')
        user_picture = user_data.get('profile_picture', '')

        return render_template('chat.html', user_email=user_email, profile_email=profile_email,
                               user_name=user_name, user_role=user_role, user_picture=user_picture, user_id=user_id)
    else:
        # Handle case where user data is not found
        return "User not found", 404

# @chat.route('/send_message', methods=['POST'])
# def send_message():
#     data = request.get_json()
#     message_text = data['message_text']
#     sender_email = data['sender_email']
#     recipient_email = data['recipient_email']
#     timestamp = data['timestamp']
#     files = data.get('files', [])
#
#     # Save message to MongoDB
#     message = {
#         'sender_email': sender_email,
#         'recipient_email': recipient_email,
#         'message_text': message_text,
#         'timestamp': timestamp,
#         'files': files
#     }
#     messages_collection.insert_one(message)
#     return jsonify({'status': 'success'})
#
#
# @chat.route('/get_messages', methods=['GET'])
# def get_messages():
#     try:
#         user_email = request.args.get('user_email')
#         profile_email = request.args.get('profile_email')
#
#         # Retrieve messages between the two users
#         messages = list(messages_collection.find({
#             '$or': [
#                 {'sender_email': user_email, 'recipient_email': profile_email},
#                 {'sender_email': profile_email, 'recipient_email': user_email}
#             ]
#         }).sort('timestamp', pymongo.ASCENDING))
#
#         return jsonify(messages)
#
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
