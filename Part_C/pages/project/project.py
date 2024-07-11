from flask import Blueprint, render_template, request
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId

# about blueprint definition
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
comment_collection = mydb['comments']

# Routes
@project.route('/project/<project_id>')
def view_project(project_id):
    project = project_collection.find_one({'_id': ObjectId(project_id)})
    if project:
        user_id = project.get('owner')  # Assuming the owner field stores the user_id
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        comments = comment_collection.find({'project_id': project_id})
        return render_template('project.html', project=project, user=user, comments=comments)
    else:
        return "Project not found", 404