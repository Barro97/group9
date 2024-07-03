from flask import *
app = Flask(__name__)

from pages.aboutus.aboutus import about_us
app.register_blueprint(about_us)

from pages.login.login import login
app.register_blueprint(login)

from pages.chat.chat import chat
app.register_blueprint(chat)

from pages.home.home import home
app.register_blueprint(home)

from pages.myprofile.my_profile import my_profile
app.register_blueprint(my_profile)

from pages.notifications.notifications import notifications
app.register_blueprint(notifications)

from pages.organization.organization import organization
app.register_blueprint(organization)

from pages.privacypolicy.privacy_policy import privacy_policy
app.register_blueprint(privacy_policy)

from pages.profile.profile import profile
app.register_blueprint(profile)

from pages.project.project import project
app.register_blueprint(project)

from pages.searchresults.search_results import search_results
app.register_blueprint(search_results)

@app.route('/')
def home():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)