from flask import Blueprint, render_template

# about blueprint definition
profile = Blueprint(
    'profile',
    __name__,
    static_folder='static',
    static_url_path='/profile',
    template_folder='templates'
)


# Routes
@profile.route('/profile')
def index():
    return render_template('profile.html')
