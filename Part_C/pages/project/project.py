from flask import *
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
from datetime import datetime, timezone, timedelta
import gridfs
import io

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
fs = gridfs.GridFS(mydb)

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
        user = users_collection.find_one({'email': user_id})
        comments = list(project_comment_collection.find({'project_id': ObjectId(project_id)}))
        print(comments)
        image_url = None
        if 'photo_id' in project:
            try:
                print(project['photo_id'])
                image_id = ObjectId(project['photo_id'])
                image_url = url_for('project.get_project_image', photo_id=image_id)
            except Exception as e:
                print(f'Error fetching image: {str(e)}')

        if 'file_id' in project:
            try:
                file_id = ObjectId(project['file_id'])
                file_url = url_for('project.get_file', file_id=file_id)
            except Exception as e:
                print(f'Error generating file URL: {str(e)}')

        return render_template('project.html', project=project, user=user, comments=comments,
                               logged_in_user=logged_in_user, image_url=image_url, file_url=file_url)
    else:
        return "Project not found", 404


@project.route('/get_image/<photo_id>', methods=['GET'])
def get_project_image(photo_id):
    try:
        photo_id = ObjectId(photo_id)  # Ensure photo_id is an ObjectId
        photo = fs.get(photo_id)
        content_type = photo.content_type if photo.content_type else 'application/octet-stream'
        return send_file(photo, mimetype=content_type, download_name=photo.filename)
    except Exception as e:
        print(f'Error fetching image: {str(e)}')
        return jsonify({'success': False, 'error': str(e)})


@project.route('/file/<file_id>')
def get_file(file_id):
    # file = fs.get(file_id)
    # return Response(file.read(),
    #                 mimetype='application/octet-stream',
    #                 headers={"Content-Disposition": f"attachment;filename={file.filename}"})
    try:
        # Convert the file_id to an ObjectId
        file_id = ObjectId(file_id)

        # Retrieve the file from GridFS
        file_data = fs.get(file_id)

        if not file_data:
            return "File not found", 404

        # Read the file data into memory
        file_stream = io.BytesIO(file_data.read())

        # Create a response object to send the file
        response = send_file(file_stream, as_attachment=True, download_name=file_data.filename)
        response.headers["Content-Disposition"] = f"attachment; filename={file_data.filename}"
        return response
    except Exception as e:
        return str(e), 500


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
