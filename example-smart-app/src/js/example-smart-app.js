if(smart == undefined)
  var smart = FHIR.client(demo); //, patientIds = getPatientIds(), patientInfo = getPatientInfo(patientIds, smart);

(function(window){

  window.drawTables = function(callback) {
      'use strict';

        // title div with label and button
        var header = d3.select("body").append("div").attr("class", "well");

        header.append("h1").append("a").attr("href", "/").text("Emory Hospital");
        header.append("h2").text(" Sepsis prediction");


        var initialData = [
          { table: "List of physicians", rows: getPractioners(true)
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
                var doctor = decodeURI(location.search.substring(1).split("=")[1]);
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
    title = decodeURI(location.search.substring(1).split("&")[0].split("=")[1]);
    d3.select("h3").text(title);
    var practitioner_data = getPractioners();
    data[0].table = "Dr. " + title;
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
          loadGraphs(decodeURI(location.search.substring(1).split("&")[1].split("=")[1]));
  }

})(window);
