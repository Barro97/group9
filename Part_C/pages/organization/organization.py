from flask import Blueprint, render_template

# about blueprint definition
organization = Blueprint(
    'organization',
    __name__,
    static_folder='static',
    static_url_path='/organization',
    template_folder='templates'
)


# Routes
@organization.route('/organization')
def index():
    return render_template('organization.html')
