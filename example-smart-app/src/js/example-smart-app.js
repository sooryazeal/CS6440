if(smart == undefined)
  var smart = FHIR.client(demo), patientIds = getPatientIds(), patientInfo = getPatientInfo(patientIds, smart);

(function(window){

  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                              'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                      }
                    }
                  });

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;
          var dob = new Date(patient.birthDate);
          var day = dob.getDate();
          var monthIndex = dob.getMonth() + 1;
          var year = dob.getFullYear();

          var dobStr = monthIndex + '/' + day + '/' + year;
          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');

          var p = defaultPatient();
          p.birthdate = dobStr;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.age = parseInt(calculateAge(dob));
          p.height = getQuantityValueAndUnit(height[0]);

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawTables = function(callback) {
      'use strict';
        console.log(patientIds);


        // title div with label and button
        var header = d3.select("body").append("div").attr("class", "well");

        header.append("h1").text("Emory Hospital");
        header.append("h2").text(" Sepsis prediction");


        // var xhttp = new XMLHttpRequest();
        // xhttp.onreadystatechange = function() {
        //   if (this.readyState == 4 && this.status == 200) {
        //    document.getElementById("demo").innerHTML = this.responseText;
        //   }
        // };
        // xhttp.open("GET", "http://hdapdemo.i3l.gatech.edu:8080/gt-fhir-webapp/base/Encounter?patient=" + , true);
        // xhttp.send();

        var initialData = [
          { table: "List of physicians", rows: [
              { row: "Doctor1" },
              { row: "Doctor2" }
            ]
          }
        ]

       window.update = function() {
        var tableDiv = d3.select("body").append("div").attr("id", "tableDiv1");

        var divs = tableDiv.selectAll("div")
            .data(window.data,                     
              function(d) { return d.table  
            }) 

        divs.exit().remove();
        var divsEnter = divs.enter().append("div")
            .attr("id", function(d) { return d.table + "Div"; })
            .attr("class", "well")
        divsEnter.append("h3").text(function(d) { return d.table; });
        var tableEnter = divsEnter.append("table")
            .attr("id", function(d) { return d.table })
            .attr("class", "table table-condensed table-striped table-bordered")
        tableEnter.append("thead")
          .append("tr")
            .selectAll("th")
            .data(["Name"])
          .enter().append("th")
            .text(function(d) { return d; })

        tableEnter.append("tbody");

        // select all tr elements in the divs update selection
        var tr = divs.select("table").select("tbody").selectAll("tr")
            .data(
              function(d) { return d.rows; },
              function(d) { return d.row }    // "key" function to disable default by-index evaluation
            ); 

        tr.exit().remove();

        tr.enter().append("tr");

        var td = tr.selectAll("td")
            .data(function(d) { return d3.values(d); });

        // use the enter method to add td elements 
        td.enter().append("td").append('a')
            .attr("href", function(d) {
              if(window.data[0].table == "List of physicians")
                return "patients.html?doctor="+d;
              else{
                var doctor = location.search.substring(1).split("=")[1];
                return "graphs.html?doctor="+doctor+"&patient="+d;
              }
            })               // add the table cell
            .text(function(d) { return d; })
            .attr("class", function() {
              if(window.data[0].table == "List of physicians")
                return "practitioner";
              else
                return "patient";
            })
      }

      window.task1 = function(callback) {
        window.data = JSON.parse(JSON.stringify(initialData));
        d3.selectAll('h6').remove();
        // load initial tables
        update();
        if(callback != undefined)
          callback();
      }

      task1(callback);
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
  };

  window.loadPractitionerData = function() {
    d3.selectAll('#tableDiv1').remove();
    title = location.search.substring(1).split("&")[0].split("=")[1];
    d3.select("h3").text(title);
    var practitioner_data = {
        "Doctor1": [
            { row: "Marla" },
            { row: "John" }
          ],
        "Doctor2": [
            { row: "Jane" },
            { row: "Marla" }
          ]};
    data[0].table = "Dr." + title;
    data[0].rows = practitioner_data[title];
    update();
    d3.select(".well").append("h6").text("Back").on('click', function() {
      history.back();
    });
  }

  window.updatePractitionerData = function() {
          drawTables(loadPractitionerData);
  }

  window.updatePatientData = function() {
          d3.selectAll('h6').remove();
           d3.select(".well").append("h6").text("Back").on('click', function() {
            history.back();
          });
          if(Object.keys(patientInfo).length == 0)
            setTimeout(function(){
              loadGraphs(location.search.substring(1).split("&")[1].split("=")[1]);
            }, 200);
          else
            loadGraphs(location.search.substring(1).split("&")[1].split("=")[1]);
  }

})(window);
