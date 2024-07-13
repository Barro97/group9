from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
from datetime import datetime
from datetime import datetime, timezone, timedelta

project = Blueprint(
    'project',
    __name__,
    static_folder='static',
    static_url_path='/project',
    template_folder='templates'
)

uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
project_collection = mydb['projects']
users_collection = mydb['users']
project_comment_collection = mydb['project_comments']

# Define local timezone offset
local_tz_offset = timedelta(hours=3)  # Adjust according to your local timezone offset


# Route to view a project
@project.route('/project/<project_id>')
def view_project(project_id):
    project = project_collection.find_one({'_id': ObjectId(project_id)})
    if project:
        if not session.get('logged_in'):
            return redirect(url_for('login.index'))
        logged_in_user = session.get('user', {})
        print(logged_in_user)  # Debug print
        user_id = project.get('owner')
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        comments = list(project_comment_collection.find({'project_id': ObjectId(project_id)}))
        return render_template('project.html', project=project, user=user, comments=comments,
                               logged_in_user=logged_in_user)
    else:
        return "Project not found", 404


@project.route('/project/<project_id>/comment', methods=['POST'])
def add_comment(project_id):
    content = request.form.get('content')
    user_email = request.form.get('user_email')

    print(f"Received user_email: {user_email}")  # Debug print
    print(f"Received content: {content}")  # Debug print

    if content and user_email:
        posting_user = users_collection.find_one({'email': user_email})
        print(f"Found user: {posting_user}")  # Debug print
        if posting_user:
            utc_now = datetime.utcnow()
            local_time = utc_now + local_tz_offset

            comment = {
                'project_id': ObjectId(project_id),
                'email': posting_user.get('email'),
                'user_name': f"{posting_user['first_name']} {posting_user['last_name']}",
                'user_picture_url': posting_user.get('profile_picture'),
                'content': content,
                'timestamp': local_time
            }
            project_comment_collection.insert_one(comment)
            return redirect(url_for('project.view_project', project_id=project_id))

    return "Failed to add comment", 400

@project.route('/project/<project_id>/like', methods=['POST'])
def like_project(project_id):
    try:
        liked = request.json.get('liked')
        project = project_collection.find_one({'_id': ObjectId(project_id)})

        if project:
            current_likes = project.get('likes', 0)
            new_likes = current_likes + 1 if liked else max(0, current_likes - 1)

            # Update project likes in the database
            project_collection.update_one(
                {'_id': ObjectId(project_id)},
                {'$set': {'likes': new_likes}}
            )

            # Return a JSON response with the updated likes count
            return jsonify({'likes': new_likes}), 200
        else:
            return jsonify({'error': 'Project not found'}), 404
    except Exception as e:
        # Log the exception for debugging purposes
        print(f"Exception occurred: {str(e)}")
        # Return a JSON response with an error message
        return jsonify({'error': 'Internal Server Error'}), 500
