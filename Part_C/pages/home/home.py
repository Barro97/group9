from flask import Blueprint, render_template, session, redirect, url_for

# about blueprint definition
home = Blueprint(
    'home',
    __name__,
    static_folder='static',
    static_url_path='/home',
    template_folder='templates'
)


# Routes
@home.route('/home')
def index():
    user = session.get('user')
    return render_template('home.html')
