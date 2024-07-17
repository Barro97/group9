from flask import Blueprint, render_template, request, redirect, flash, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

signup = Blueprint(
    'signup',
    __name__,
    static_folder='static',
    static_url_path='/signup',
    template_folder='templates'
)

uri = ("mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/"
       "?retryWrites=true&w=majority&appName=Workfolio")
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient['user_database']
users_collection = mydb['users']

@signup.route('/signup', methods=['GET', 'POST'])
def signup_page():
    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        email = request.form['email']
        phone_number = request.form['phone_number']
        dob_day = request.form['dob_day']
        dob_month = request.form['dob_month']
        dob_year = request.form['dob_year']
        country = request.form['country']
        city = request.form['city']
        password = request.form['password']
        verify_password = request.form['verify_password']

        # Check if the email already exists in the database
        if users_collection.find_one({"email": email}):
            return jsonify({'status': 'error', 'message': "Email already exists. Please use a different email address."}), 400

        # Save the data directly without validation
        user_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone_number': phone_number,
            'dob_day': dob_day,
            'dob_month': dob_month,
            'dob_year': dob_year,
            'country': country,
            'city': city,
            'password': password,
            'profile_picture': 'https://w7.pngwing.com/pngs/753/432/png-transparent-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-people-thumbnail.png'
        }
        users_collection.insert_one(user_data)
        return jsonify({'status': 'success'}), 200

    return render_template('signup.html')
