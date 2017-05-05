The prediction section includes two files.

`enrichment_helpers.py` gathers the necessary data and feeds it into the prediction model, returning a prediction value for a given data point.

`model.py` creates the prediction models.  It requires MIMIC data to run properly.  There are two variables at the top of the script for the itemid of the lab and filename to save the lab in.  Everything else should run automatically.  The script will output a pickle file containing the model object.
