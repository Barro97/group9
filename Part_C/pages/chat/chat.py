from flask import Blueprint, render_template

# about blueprint definition
chat = Blueprint(
    'chat',
    __name__,
    static_folder='static',
    static_url_path='/chat',
    template_folder='templates'
)


# Routes
@chat.route('/chat')
def index():
    return render_template('chat.html')
