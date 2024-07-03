from flask import Blueprint, render_template

# about blueprint definition
privacy_policy = Blueprint(
    'privacy_policy',
    __name__,
    static_folder='static',
    static_url_path='/privacy_policy',
    template_folder='templates'
)


# Routes
@privacy_policy.route('/privacy_policy')
def index():
    return render_template('privacy policy.html')
