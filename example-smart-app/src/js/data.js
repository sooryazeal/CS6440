function getPatientIds() {
	return ["20711", "44806", "41182", "23039", "46415", "12122", "29030", "29983", "32376", "44269", "23197", "42715", "41260", "25326", "29845", "41269", "16856", "43564", "28089", "12122", "45145", "28941", "32008", "12008", "27576", "14245"];
}

function getPatientInfo(patientIds, smart) {
	var patientInfo = {};
  patientIds.forEach(function(pid) {
  	smart.api.read({type: "Patient", id: "20711"}).then(function(pt) {
  		patientInfo[pid] = getPatientName(pt.data);
	  });
  })
  return patientInfo;
}

function getLabValues(pat_id, callback) {
    var relCodes = {
      "804-5":"804-5",
      "718-7":"718-7",
      "32693-4":"32693-4",
      "1975-2":"1975-2",
      "2160-0":"2160-0",
      "777-3":"777-3"
    }, sepObs;
		smart.api.fetchAll({type: "Observation", query: {patient: pat_id}}).then(function(pt) {
      var relObs = pt.map(function(d) {
        if(relCodes[d.code.coding[0].code]) {
          return d;
        }
      }).filter(function(n){ return n != undefined }), 
      groupBy = function(xs, key) {
        return xs.reduce(function(rv, x) {
          (rv[key(x)] = rv[key(x)] || []).push(x);
          return rv;
        }, {});
      },
      func = function (d) {return(d.code.coding[0].code)},
      groupedObs = groupBy(relObs, func);
      sepObs = {
        "804-5":{"data":{"h12": [],"h24": [],"h72": [],"d7": []}, "critical":{"low": 2, "high": 4, "vlow": 1, "vhigh":5}},
        "718-7":{"data":{"h12": [],"h24": [],"h72": [],"d7": []}, "critical":{"low": 2, "high": 4, "vlow": 1, "vhigh":5}},
        "32693-4":{"data":{"h12": [],"h24": [],"h72": [],"d7": []}, "critical":{"low": 2, "high": 4, "vlow": 1, "vhigh":5}},
        "1975-2":{"data":{"h12": [],"h24": [],"h72": [],"d7": []}, "critical":{"low": 2, "high": 4, "vlow": 1, "vhigh":5}},
        "2160-0":{"data":{"h12": [],"h24": [],"h72": [],"d7": []}, "critical":{"low": 2, "high": 4, "vlow": 1, "vhigh":5}},
        "777-3":{"data":{"h12": [],"h24": [],"h72": [],"d7": []}, "critical":{"low": 2, "high": 4, "vlow": 1, "vhigh":5}}
      };
      var currentTime = new Date("2166-07-22T11:00:00-04:00"), h12 = currentTime.setHours(currentTime.getHours() - 12),
      h24 = currentTime.setHours(currentTime.getHours() - 24), h72 = currentTime.setHours(currentTime.getHours() - 72),
      d7 = currentTime.setHours(currentTime.getHours() - 168);
      Object.keys(groupedObs).forEach(function(key){
        data = groupedObs[key], lab = key;
        data.forEach(function(d) {
          var value = {type: 'actual', 'timestamp': new Date(d.effectiveDateTime), 'value': d.valueQuantity.value}
          if(new Date(d.effectiveDateTime) > h12)
            sepObs[lab]['data']["h12"].push(value);
          else if(new Date(d.effectiveDateTime) > h24)
            sepObs[lab]['data']["h24"].push(value);
          else if(new Date(d.effectiveDateTime) > h72)
            sepObs[lab]['data']["h72"].push(value);
          else if(new Date(d.effectiveDateTime) > d7)
            sepObs[lab]['data']["d7"].push(value);
        });
      }) 
    });
    waitForElement();
      function waitForElement(){
      if(typeof sepObs !== "undefined"){
          callback(sepObs, 3);
      }
      else{
          setTimeout(waitForElement, 250);
      }
}

          // "lab1": {"data":
          // [
          // {'type': 'actual', 'timestamp': 1, 'value': 2},
          // {'type': 'pred', 'timestamp': 2, 'value': 3},
          // {'type': 'pred', 'timestamp': 3, 'value': 4}
          // ], 
          // "critical": {"low": 2, "high": 4}},
          // "lab2": {"data":
          // [
          //   {'type': 'actual', 'timestamp': 1, 'value': 20},
          //   {'type': 'pred', 'timestamp': 2, 'value': 30}
          // ], 
          // "critical": {"low": 19, "high": 31}},
          // "lab3": {"data":
          // [
          //   {'type': 'actual', 'timestamp': 1, 'value': 12},
          //   {'type': 'pred', 'timestamp': 2, 'value': 13}
          // ], 
          // "critical": {"low": 11.5, "high": 13.5}},
          // "lab4": {"data":
          // [
          //   {'type': 'actual', 'timestamp': 1, 'value': 2},
          //   {'type': 'pred', 'timestamp': 2, 'value': 30}
          // ], 
          // "critical": {"low": 2, "high": 4}},
          // "lab5": {"data":
          // [
          //   {'type': 'actual', 'timestamp': 1, 'value': 22},
          //   {'type': 'pred', 'timestamp': 2, 'value': 3}
          // ], 
          // "critical": {"low": 2, "high": 4}},
          // "lab6": {"data":
          // [
          //   {'type': 'actual', 'timestamp': 1, 'value': 2},
          //   {'type': 'pred', 'timestamp': 2, 'value': 3}
          // ], 
          // "critical": {"low": 2, "high": 4}}
}