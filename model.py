import pandas as pd
import numpy as np
import datetime as dt
import pickle
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel, WhiteKernel

pd.options.mode.chained_assignment = None  # default='warn'

labid = 51301
labName = 'hemoglobin'

chartEvents = pd.read_csv('sample_chartevents_2.csv')
sampleLabs = pd.read_csv('sample_labs_with_loinc_codes_2.csv')
sepsisTime = pd.read_csv('sample_ids_2.csv')
pred = pd.read_csv('predictors.csv')

chartEvents['charttime'] = pd.to_datetime(chartEvents['charttime'])
chartEvents = chartEvents.loc[chartEvents['itemid'].isin(pred.itemid)]
sampleLabs['charttime'] = pd.to_datetime(sampleLabs['charttime'])

subjectIDs = chartEvents.subject_id.unique()
dataList = []
for sid in subjectIDs:
    c = chartEvents.loc[chartEvents['subject_id'] == sid]
    s = sampleLabs.loc[sampleLabs['subject_id'] == sid]
    lab = s.loc[s['itemid'] == labid]
    lab.itemid = lab.itemid.apply(str)
    vitals = c.loc[c['itemid'].isin(pred.itemid)]
    vitals.itemid = vitals.itemid.apply(str)
    vitals = vitals.pivot_table(index='charttime', columns='itemid', values='valuenum', aggfunc='mean')
    vitals = vitals.reset_index()
    vitals.charttime = vitals.charttime.dt.round('60min')
    vitals = vitals.groupby(vitals.charttime).mean().reset_index()
    if set(['220052', '223761', '224690', '220277', '220045']).issubset(vitals.columns):
        if '225312' in vitals.columns:
            vitals['220052'] = vitals['220052'].combine_first(vitals['225312'])
        vitals = vitals[['charttime', '220052', '223761', '224690', '220277', '220045']]
    else:
        continue
    vitals = vitals.interpolate()
    lab = lab[['charttime', 'valuenum']]
    lab.charttime = lab.charttime.dt.round('60min')
    lab = lab.groupby(lab.charttime).mean().reset_index()
    lab.rename(columns={'valuenum': 'lab'}, inplace=True)
    data = lab.merge(vitals, 'outer', 'charttime').sort_values('charttime').reset_index()
    data['last'] = data['lab'].fillna(method='ffill').shift(1)
    data['subject_id'] = sid
    data = data.dropna()
    dataList.append(data)
data = pd.concat(dataList)
kernel = ConstantKernel(1.0, (1e-3, 1e3)) * RBF(10, (1e-2, 1e2)) + WhiteKernel(10)
gp = GaussianProcessRegressor(kernel=kernel, normalize_y=True, n_restarts_optimizer=10)
X = data.ix[:,['last', '220052', '223761', '224690', '220277', '220045']]
y = data.ix[:,'lab']
model = gp.fit(X,y)
with open(labName + 'pkl', 'wb') as f:
    pickle.dump(model, f, protocol=2)
