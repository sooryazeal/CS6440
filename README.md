# Python Streaming Client

 
Using config.json, you can configure,
* BASE URL of the FHIR server                                                                                           eg., "http://polaris.i3l.gatech.edu:8080/fhir-omopv5/base"
* Patient Ids                                                                                                                            eg.,         ["1","2","3"]
* Streaming Interval (seconds)                                                                                           eg., 20
* Offset time (At what point the streaming has to start from)                   eg., "2005-01-10T00:00:00-05:00"
* Acceleration factor (Scaling the interval)                                    eg., 1576800
* Code (The code of the observation wanted, it is made a map for speed)         eg., {"17856-6": "17856-6"}
 
## To run the client, 

cd into the folder and use,

`python streaming_client.py`

P.S The Gatech FHIR Server is not up currently, hence running the client will not produce any output
