# Image Annotation Framework

The code is divided into 2 parts:

* Client: This is the app UI written with React library.
* Service: This is the Rest API written with FastAPI framework. 

To run the application:

* Run service code: Open Powershell in service dir and run following commands:
    1. ``pip install -r requirements.txt`` - This will install Python package dependencies
    2. ``py setupDb.py`` - This will initialize server database using ``sqlite.db`` file
    3. ``uvicorn main:app`` - This will start service on ``http://localhost:8000``
* Run client code: Open powershell in client dir and run following commands:
    1. ``npm install`` - This will install Node package dependencies 
    2. ``npm run start`` - This will start app in ``http://localhost:3000``
