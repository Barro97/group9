from flask import Blueprint, render_template, session, redirect, url_for

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
    if not session.get('logged_in'):
        return redirect(url_for('login.index'))

    user = session.get('user', {})
    first_name = user.get('first_name')
    last_name = user.get('last_name')
    full_name = f"{first_name} {last_name}"
    role = user.get('role')
    profile_picture = user.get('profile_picture')
    followers = user.get('followers', 100)  # You can set a default value or fetch it from DB
    linkedin = user.get('linkedin', 'https://www.linkedin.com/in/rina-klinchuk/')
    github = user.get('github', 'https://github.com/rinaklin')
    facebook = user.get('facebook', 'https://www.facebook.com/rina.klinchuk/')
    about_me = user.get('about_me')

    return render_template('my profile.html', full_name=full_name, role=role, followers=followers, profile_picture=profile_picture, linkedin=linkedin, github=github, facebook=facebook, about_me=about_me)