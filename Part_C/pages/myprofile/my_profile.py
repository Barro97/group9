from flask import Blueprint, render_template

# about blueprint definition
my_profile = Blueprint(
    'home',
    __name__,
    static_folder='static',
    static_url_path='/my_profile',
    template_folder='templates'
)


# Routes
@my_profile.route('/my_profile')
def index():
    return render_template('my profile.html')
