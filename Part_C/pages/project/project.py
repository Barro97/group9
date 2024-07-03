from flask import Blueprint, render_template

# about blueprint definition
project = Blueprint(
    'project',
    __name__,
    static_folder='static',
    static_url_path='/project',
    template_folder='templates'
)


# Routes
@project.route('/project')
def index():
    return render_template('project.html')
