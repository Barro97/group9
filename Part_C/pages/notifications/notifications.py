from flask import Blueprint, render_template

# about blueprint definition
notifications = Blueprint(
    'notifications',
    __name__,
    static_folder='static',
    static_url_path='/notifications',
    template_folder='templates'
)


# Routes
@notifications.route('/notifications')
def index():
    return render_template('notifications.html')
