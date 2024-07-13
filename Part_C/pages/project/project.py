from flask import Blueprint, render_template, request, redirect, url_for
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
from datetime import datetime

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

# Route to view a project
@project.route('/project/<project_id>')
def view_project(project_id):
    project = project_collection.find_one({'_id': ObjectId(project_id)})
    if project:
        user_id = project.get('owner')
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        comments = list(project_comment_collection.find({'project_id': ObjectId(project_id)}))
        return render_template('project.html', project=project, user=user, comments=comments)
    else:
        return "Project not found", 404

# Route to handle comment submission
@project.route('/project/<project_id>/comment', methods=['POST'])
def add_comment(project_id):
    content = request.form.get('content')
    user_id = request.form.get('user_id')

    if content and user_id:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if user:
            comment = {
                'project_id': ObjectId(project_id),
                'user_id': ObjectId(user_id),
                'user_name': f"{user['first_name']} {user['last_name']}",
                'user_picture_url': user.get('profile_picture'),
                'content': content,
                'timestamp': datetime.utcnow()
            }
            project_comment_collection.insert_one(comment)
            return redirect(url_for('project.view_project', project_id=project_id))
    return "Failed to add comment", 400


