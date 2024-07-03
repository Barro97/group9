from flask import Blueprint, render_template

# about blueprint definition
search_results = Blueprint(
    'search_results',
    __name__,
    static_folder='static',
    static_url_path='/search_results',
    template_folder='templates'
)


# Routes
@search_results.route('/search_results')
def index():
    return render_template('search_results.html')
