from flask import Blueprint, render_template

# about blueprint definition
about_us = Blueprint(
    'aboutus',
    __name__,
    static_folder='static',
    static_url_path='/aboutus',
    template_folder='templates'
)


# Routes
@about_us.route('/aboutus')
def index():
    return render_template('about us.html')
