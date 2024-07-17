from flask import *
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId

# about blueprint definition
my_profile = Blueprint(
    'my_profile',
    __name__,
    static_folder='static',
    static_url_path='/my_profile',
    template_folder='templates'
)


# MongoDB setup
uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
users_collection = mydb['users']
project_collection = mydb['projects']
experience_collection = mydb['experience']
education_collection = mydb['education']
org_collection = mydb['organizations']
posts_collection = mydb['posts']

# Routes
@my_profile.route('/my_profile')
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login.index'))

    user = session.get('user', {})
    email = user.get('email')
    first_name = user.get('first_name')
    last_name = user.get('last_name')
    full_name = f"{first_name} {last_name}"
    role = user.get('role')
    profile_picture = user.get('profile_picture')
    followers = user.get('followers', 0)  # You can set a default value or fetch it from DB
    linkedin = user.get('linkedin')
    github = user.get('github')
    facebook = user.get('facebook')
    about_me = user.get('about_me')

    projects = list(project_collection.find({'owner': email}))
    experiences = list(experience_collection.find({'user_email': email}))
    educations = list(education_collection.find({'user_email': email}))

    # Fetch logos for experiences
    for exp in experiences:
        org = mydb['organizations'].find_one({'org_name': exp['org_name']})
        if org:
            exp['logo'] = org.get('logo', '')

    # Fetch logos for educations
    for edu in educations:
        org = mydb['organizations'].find_one({'org_name': edu['org_name']})
        if org:
            edu['logo'] = org.get('logo', '')

    return render_template('my profile.html', full_name=full_name, role=role, followers=followers, profile_picture=profile_picture, linkedin=linkedin, github=github, facebook=facebook, about_me=about_me, projects=projects, experiences=experiences, educations=educations)

@my_profile.route('/update_profile', methods=['POST'])
def update_profile():
    if not session.get('logged_in'):
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    user = session.get('user', {})
    email = user.get('email')

    # Determine which section is being updated
    section_id = request.form.get('sectionId')
    update_data = {}

    if section_id == 'top-section':
        # Get form data for top-section
        first_name = request.form.get('firstName')
        last_name = request.form.get('lastName')
        position = request.form.get('position')

        update_data = {
            'first_name': first_name,
            'last_name': last_name,
            'role': position,
        }

    elif section_id == 'links':
        # Get form data for links
        linkedin = request.form.get('linkedin')
        github = request.form.get('github')
        facebook = request.form.get('facebook')

        update_data = {
            'linkedin': linkedin,
            'github': github,
            'facebook': facebook,
        }
    elif section_id == 'about':
        # Get form data for about section
        about_me = request.form.get('aboutMe')

        update_data = {
            'about_me': about_me,
        }
    elif section_id == 'background':
        # Get form data for background section
        type_ = request.form.get('type')
        organization = request.form.get('organization')
        position = request.form.get('position')
        period = request.form.get('period')

        org = org_collection.find_one({'org_name': organization})
        if not org:
            return jsonify({'status': 'error', 'message': 'Organization not found'})

        background_data = {
            'user_email': email,
            'org_name': organization,
            'description': position,
            'period': period,
            'logo': org['logo'],
        }

        if type_ == 'experience':
            experience_collection.insert_one(background_data)
        elif type_ == 'education':
            education_collection.insert_one(background_data)
    print(update_data)
    users_collection.update_one({'email': email}, {'$set': update_data})

    # Update session
    session['user'] = users_collection.find_one({'email': email})
    session['user']['_id'] = str(session['user']['_id'])  # Convert ObjectId to string

    response_data = {'status': 'success', 'message': 'Profile updated successfully'}
    if 'first_name' in update_data:
        response_data['first_name'] = update_data['first_name']
    if 'last_name' in update_data:
        response_data['last_name'] = update_data['last_name']
    if 'role' in update_data:
        response_data['role'] = update_data['role']
    if 'linkedin' in update_data:
        response_data['linkedin'] = update_data['linkedin']
    if 'github' in update_data:
        response_data['github'] = update_data['github']
    if 'facebook' in update_data:
        response_data['facebook'] = update_data['facebook']
    if 'about_me' in update_data:
        response_data['about_me'] = update_data['about_me']

    return jsonify(response_data)

@my_profile.route('/get_projects', methods=['GET'])
def get_projects():
    if not session.get('logged_in'):
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    user = session.get('user', {})
    email = user.get('email')
    projects = list(project_collection.find({'owner': email}, {'_id': 1, 'title': 1}))

    for project in projects:
        project['_id'] = str(project['_id'])  # Convert ObjectId to string

    return jsonify({'status': 'success', 'projects': projects})

@my_profile.route('/delete_project', methods=['POST'])
def delete_project():
    if not session.get('logged_in'):
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    project_id = request.json.get('projectId')
    if not project_id:
        return jsonify({'status': 'error', 'message': 'Project ID is required'})

    # Delete the project
    project_collection.delete_one({'_id': ObjectId(project_id)})

    # Delete the post containing the project ID
    posts_collection.delete_one({'project': project_id})

    return jsonify({'status': 'success', 'message': 'Project and related posts deleted successfully'})

@my_profile.route('/get_organizations', methods=['GET'])
def get_organizations():
    if not session.get('logged_in'):
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    organizations = list(org_collection.find({}, {'_id': 0, 'org_name': 1}))

    return jsonify({'status': 'success', 'organizations': organizations})
