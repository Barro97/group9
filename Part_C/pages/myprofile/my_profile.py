from flask import Blueprint, render_template

# about blueprint definition
my_profile = Blueprint(
    'my_profile',
    __name__,
    static_folder='static',
    static_url_path='/my_profile',
    template_folder='templates'
)


# Routes
@my_profile.route('/my_profile')
def index():
    name='Rina'
    return render_template('my profile.html', name=name)
