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


# mydb = myclient['user_database']
# users_collection = mydb['users']
#
# mydict = {'username': 'Rinak', 'email': 'fmklmk@gmail.com', 'password': '123456'}
# x=users_collection.insert_one(mydict)

#
# mydb = myclient["sample_mflix"]
#
# dblist = myclient.list_database_names()
# # if "sample_mflix" in dblist:
# #     print("The database exists.")
#
# print(myclient.list_database_names())
# collist = mydb.list_collection_names()
# print(collist)
#
#
# mydb = myclient['user_database']
# users_collection = mydb['users']
