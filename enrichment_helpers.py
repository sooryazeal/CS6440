# xxunscrambl

import pickle

"""Provides analytics for enrichment"""

# Incoming tuple contains
#    ts: time in seconds since epoch
#    effectiveDateTime: timestamp from the observations
#    patientId: patient's unique identifier
#    patientName: name of the patient
#    practitioners: list of practitioners
#
# The function below is used to fetch the latest value
# value of observation corresponding to 220050. If the
# incoming tuple contains the code 220050, then it is
# the latest value, else the value retrieved from Redis
# is the latest value (can be None). Add None handling,
# if there is a need.
#
# Also, note that the value returned by this function
# then gets stored in Redis as the lastKnown220050 and
# the tuple has an additional attribute - latest220050.
#
# Please add more such methods for whatever codes that
# your team wants to retain in Redis.
#
#
def get_latest220052(tuple_):
    if tuple_.code == '220052':
        return tuple_.value
    elif tuple_.lastKnown220052 is None:
        return 82.5
    else:
        return tuple_.lastKnown220052

def get_latest223761(tuple_):
    if tuple_.code == '223761':
        return tuple_.value
    elif tuple_.lastKnown223761 is None:
        return 98.8
    else:
        return tuple_.lastKnown223761

def get_latest224690(tuple_):
    if tuple_.code == '224690':
        return tuple_.value
    elif tuple_.lastKnown224690 is None:
        return 22.2
    else:
        return tuple_.lastKnown224690

def get_latest220277(tuple_):
    if tuple_.code == '220277':
        return tuple_.value
    elif tuple_.lastKnown220277 is None:
        return 97.3
    else:
        return tuple_.lastKnown220277

def get_latest220045(tuple_):
    if tuple_.code == '220045':
        return tuple_.value
    elif tuple_.lastKnown220045 is None:
        99.9
    else:
        return tuple_.lastKnown220045

def get_latest51301(tuple_):
    if tuple_.code == '51301':
        return tuple_.value
    elif tuple_.lastKnown51301 is None:
        return 11.8
    else:
        return tuple_.lastKnown51301

def get_latest220228(tuple_):
    if tuple_.code == '220228':
        return tuple_.value
    elif tuple_.lastKnown220228 is None:
        return 9.6
    else:
        return tuple_.lastKnown220228

def get_latest50813(tuple_):
    if tuple_.code == '50813':
        return tuple_.value
    elif tuple_.lastKnown50813 is None:
        return 2.5
    else:
        return tuple_.lastKnown50813

def get_latest50885(tuple_):
    if tuple_.code == '50885':
        return tuple_.value
    elif tuple_.lastKnown50885 is None:
        return 7.0
    else:
        return tuple_.lastKnown50885

def get_latest50912(tuple_):
    if tuple_.code == '50912':
        return tuple_.value
    elif tuple_.lastKnown50912 is None:
        return 1.5
    else:
        return tuple_.lastKnown50912

def get_latest51265(tuple_):
    if tuple_.code == '51265':
        return tuple_.value
    elif tuple_.lastKnown51265 is None:
        return 240.1
    else:
        return tuple_.lastKnown51265

#
# This function prepares the input to be sent to the
# prediction function. Please edit as required.
#
def get_inputs(tuple_):
    inputs = [
        tuple_.latest220052,
        tuple_.latest223761,
        tuple_.latest224690,
        tuple_.latest220277,
        tuple_.latest220045,
        ]
    return inputs

#
# This is where we load the pickled model
#
def instantiate_model(filename):
    return pickle.load(open(filename, 'rb'))

#
# models being instantiated as globals
#
_bilirubin_model = instantiate_model('/tmp/team-1/bilirubin.pkl')
_lactate_model = instantiate_model('/tmp/team-1/lactate.pkl')
_platelet_model = instantiate_model('/tmp/team-1/platelet.pkl')
_wbc_model = instantiate_model('/tmp/team-1/wbc.pkl')
_creatinine_model = instantiate_model('/tmp/team-1/creatinine.pkl')
_hemoglobin_model = instantiate_model('/tmp/team-1/hemoglobin.pkl')

#
# This function gets invokde for each new tuple
#
def get_bilirubinPrediction(tuple_):
    inputs = get_inputs(tuple_)
    prediction, sigma = _bilirubin_model.predict([tuple_.latest50885] + inputs, return_std=True)
    return prediction

def get_lactatePrediction(tuple_):
    inputs = get_inputs(tuple_)
    prediction, sigma = _lactate_model.predict([tuple_.latest50813] + inputs, return_std=True)
    return prediction

def get_plateletPrediction(tuple_):
    inputs = get_inputs(tuple_)
    prediction, sigma = _platelet_model.predict([tuple_.latest51265] + inputs, return_std=True)
    return prediction

def get_wbcPrediction(tuple_):
    inputs = get_inputs(tuple_)
    prediction, sigma = _wbc_model.predict([tuple_.latest51301] + inputs, return_std=True)
    return prediction

def get_creatitinePrediction(tuple_):
    inputs = get_inputs(tuple_)
    prediction, sigma = _creatinine_model.predict([tuple_.latest50912] + inputs, return_std=True)
    return prediction

def get_hemoglobinPrediction(tuple_):
    inputs = get_inputs(tuple_)
    prediction, sigma = _creatinine_model.predict([tuple_.latest220228] + inputs, return_std=True)
    return prediction
