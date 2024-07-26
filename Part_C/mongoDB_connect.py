from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo

uri = "mongodb+srv://rinak:SbSaxSwP6TEHmWGw@workfolio.w1hkpdf.mongodb.net/?retryWrites=true&w=majority&appName=Workfolio"
myclient = MongoClient(uri, server_api=ServerApi('1'))

try:
    myclient.admin.command('ping')
    print("Pinged your deployment. You Successfully Connected!")
except Exception as e:
    print(e)

print(pymongo.version)


