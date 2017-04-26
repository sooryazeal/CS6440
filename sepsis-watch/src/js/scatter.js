function loadGraphs(pat_name) {
  var header = d3.select("body").append("div").attr("class", "well");
  var tableDiv = d3.select("body").append("div").attr("id", "tableDiv1");
  var divs = tableDiv.append("div")
      .attr("id", function(d) { return "Div"; })
      .attr("class", "well")
  header.append("h1").text("Emory Hospital");
  header.append("h2").text(" Sepsis Watch");
  doc = decodeURI(location.search.substring(1).split("&")[0].split("=")[1]);
  divs.append("h3")
  .text(function(d) { return pat_name; })
  .append("a").attr("href", function() { return "patients.html?doctor=" + doc;}).text(function() {return ' (' + doc + ')';});

  window.prepareloadGraph = function(labValues = window.labValues, time = false, click = false) {
    d3.selectAll('#tableDiv1 .well').append('span').attr('class', 'circle').append('text').text("actual");
    d3.selectAll('#tableDiv1 .well').append('span').attr('class', 'circle second').append('text').text("predicted");
    var labs = location.search.substring(1).split("&")[2];
    if(labs)
    {
      var lab = labs.split("=")[1];
      hash = loadGraph(lab, labValues, time, click);
      zoomWidth = (hash['width']-(5*hash['width']))/2;
      zoomHeight = ((innerHeight * 0.9)-(5*innerHeight))/2;
    }
    else{
      loadGraph("804-5", labValues, time, click),loadGraph("718-7", labValues, time),hash = loadGraph("32693-4", labValues, time),loadGraph("1975-2", labValues, time),loadGraph("2160-0", labValues, time),loadGraph("777-3", labValues, time);
    }
  }

  getLabValues(pat_name, prepareloadGraph);

  function drawScatter(data, width, height, margin, name, lab_name, unit, sd, red = false, vred = false) {
    
    data.forEach(function(d){ d.timestamp = new Date(d.timestamp) });
    var curr = new Date(), maxTime = curr.setHours(curr.getHours() + 24),
    minTime = curr.setHours(curr.getHours() - 195);

    var lastActual = $.grep(data, function(d) {return d.type == "actual";}).sort(function(a,b) {return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0);} ).slice(-1);
    var newt = lastActual.concat($.grep(data, function(d) {return d.type == "pred";}).sort(function(a,b) {return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0);} ));
    var limit = newt.length -  1, sd = sd;

    var x = d3.time.scale()
        .range([0, width]).nice(),
        xScale = d3.time.scale().range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]).nice(),
        yScale = d3.scale.linear().range([height, 0]);

    var xCat = "timestamp",
        yCat = "value",
        colorCat = "type";

      var xMax = new Date(maxTime),
          xMin = new Date(minTime),
          yMax = d3.max(data, function(d) { return d[yCat]; }) * 1.15,
          yMin = d3.min(data, function(d) { return d[yCat]; }),
          yMin = yMin > 0 ? 0 : yMin;

      x.domain([xMin, xMax]);
      y.domain([yMin, yMax]);
      if(width < 400) 
        ticks = 5;
      else
        ticks = 12;
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickSize(-height)
          .ticks(ticks)
          .tickFormat(d3.time.format("%a %d, %I %p"));


      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickSize(-width);

      var color = {"actual": "rgb(31, 119, 180)", "pred": "#2aaf5b"}

      var tip = d3.tip()
          .attr("class", "d3-tip")
          .offset([-10, 0])
          .html(function(d) {
            return d3.time.format("%a %d, %I %p")(d[xCat]) + "<br/>" + d[yCat].toFixed(2) + unit;
          });

      var zoomBeh = d3.behavior.zoom()
          .x(x)
          .y(y)
          .scaleExtent([0, 500])
          .on("zoom", zoom);

      var xzoomBeh = d3.behavior.zoom()
          .x(x)
          .scaleExtent([0, 500])
          .on("zoom", zoom);

      var yzoomBeh = d3.behavior.zoom()
          .y(y)
          .scaleExtent([0, 500])
          .on("zoom", zoom);
      

      var svg_parent = d3.selectAll('#tableDiv1 .well')
        .append("svg"), 
        svg = svg_parent.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg_parent.append('g').append("text")
        .attr("x", width/2)
        .attr("y", 12)
        .attr("class", "label lab")
        .text(name);


      var rect = svg.append('a')
        .attr("href", function() {
          if(width < 400)
            return location.pathname.split("/").slice(-1)[0] + location.search + "&lab="+lab_name;
        }).append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("style", function() {
              if(vred) 
                return "fill:#f78d85";
              else if(red)
                return "fill:#f9cba7";
            })
            .call(xzoomBeh);

      $('.btn-secondary').on('click', function() {
        $('.btn-secondary').map(function(i,d) {d.setAttribute('style', 'background-color: none')});
        this.setAttribute('style', 'background-color: #96e2f2');
        if(this.textContent == "X Axis") {
          rect.call(xzoomBeh);
        }
        else if(this.textContent == "Y Axis") {
          rect.call(yzoomBeh);
        }
        else {
          rect.call(zoomBeh);
        }
      });

      $('.btn-secondary.current').trigger('click');

      rect.call(tip);

      svg.append("svg:line")
                .attr("class", "current")
                        .attr("x1", x(new Date()))
                        .attr("x2", x(new Date()))
                        .attr("y1", 0)
                        .attr("y2", height)
                        .style("stroke", "rgb(130, 57, 30)")
                        .attr("stroke-dasharray", "5, 3"  );

        svg.append("svg:line")
                        .attr("class", "critical")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", y(labValues[lab_name]["critical"]["low"]))
                        .attr("y2", y(labValues[lab_name]["critical"]["low"]))
                        .style("stroke", "rgb(10, 20, 114)")
                        .attr("stroke-dasharray", "5, 3"  );

        svg.append("svg:line")
                        .attr("class", "critical")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", y(labValues[lab_name]["critical"]["high"]))
                        .attr("y2", y(labValues[lab_name]["critical"]["high"]))
                        .style("stroke", "rgb(10, 20, 114)")
                        .attr("stroke-dasharray", "5, 3"  );

        svg.append("svg:line")
                        .attr("class", "critical")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", y(labValues[lab_name]["critical"]["vlow"]))
                        .attr("y2", y(labValues[lab_name]["critical"]["vlow"]))
                        .attr("style", "stroke: rgb(58, 196, 150); stroke-width: 2px;")
                        .attr("stroke-dasharray", "7, 1"  );

        svg.append("svg:line")
                        .attr("class", "critical")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", y(labValues[lab_name]["critical"]["vhigh"]))
                        .attr("y2", y(labValues[lab_name]["critical"]["vhigh"]))
                        .attr("style", "stroke: rgb(58, 196, 150); stroke-width: 2px;")
                        .attr("stroke-dasharray", "7, 1"  );

      svg.append("g")
          .classed("x axis", true)
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .classed("label", true)
          .attr("x", width+20)
          .attr("y", margin.bottom - 10)
          .style("text-anchor", "end")
          .text(xCat);
      svg.append("g")
          .classed("y axis", true)
          .call(yAxis)
        .append("text")
          .classed("label", true)
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left/2)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(unit);

      var objects = svg.append("svg")
          .classed("objects", true)
          .attr("width", width)
          .attr("height", height);

      objects.append("svg:line")
          .classed("axisLine hAxisLine", true)
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", width)
          .attr("y2", 0)
          .attr("transform", "translate(0," + height + ")");

      objects.append("svg:line")
          .classed("axisLine vAxisLine", true)
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", height);

      objects.selectAll(".dot")
          .data(data)
        .enter().append("circle")
          .classed("dot", true)
          .attr("r", function (d) { return 5; })
          .attr("transform", transform)
          .style("fill", function(d) { return color[d[colorCat]]; })
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide);

      d3.selectAll(".x.axis").selectAll(".tick text").attr("transform", "rotate(-10)").attr("dy", "0.5em").attr("dx", "-3.4em")
      svg.selectAll('rect.sd').remove();
        svg.selectAll('a').append("rect").attr('class', "sd")
                            .attr("x", x(newt[1].timestamp)-10)
                            .attr("y", y(newt[1].value + sd))
                            .attr("width", 20)
                            .attr("height", y.range()[0] - y(2*sd))
                            .style('fill', '#f2f2bc');


      function zoom() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        svg.selectAll(".dot")
            .attr("transform", transform);
        svg.selectAll(".x.axis").selectAll(".tick text").attr("transform", "rotate(-10)").attr("dy", "0.5em").attr("dx", "-3.4em")
        svg.selectAll("line.critical").remove();
        svg.selectAll("line.current").remove();

        svg.append("svg:line")
        .attr("class", "current")
                .attr("x1", x(new Date()))
                .attr("x2", x(new Date()))
                .attr("y1", 0)
                .attr("y2", height)
                .style("stroke", "rgb(130, 57, 30)")
                .attr("stroke-dasharray", "5, 3"  );
        svg.append("svg:line")
                        .attr("class", "critical")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", y(labValues[lab_name]["critical"]["low"]))
                        .attr("y2", y(labValues[lab_name]["critical"]["low"]))
                        .style("stroke", "rgb(10, 20, 114)")
                        .attr("stroke-dasharray", "5, 3"  );

        svg.append("svg:line")
                        .attr("class", "critical")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", y(labValues[lab_name]["critical"]["high"]))
                        .attr("y2", y(labValues[lab_name]["critical"]["high"]))
                        .style("stroke", "rgb(10, 20, 114)")
                        .attr("stroke-dasharray", "5, 3"  );

        svg.append("svg:line")
                        .attr("class", "critical")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", y(labValues[lab_name]["critical"]["vlow"]))
                        .attr("y2", y(labValues[lab_name]["critical"]["vlow"]))
                        .attr("style", "stroke: rgb(58, 196, 150); stroke-width: 2px;")
                        .attr("stroke-dasharray", "7, 1"  );

        svg.append("svg:line")
                        .attr("class", "critical")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", y(labValues[lab_name]["critical"]["vhigh"]))
                        .attr("y2", y(labValues[lab_name]["critical"]["vhigh"]))
                        .attr("style", "stroke: rgb(58, 196, 150); stroke-width: 2px;")
                        .attr("stroke-dasharray", "7, 1"  );
        svg.selectAll('rect.sd').remove();
        svg.selectAll('a').append("rect").attr('class', "sd")
                            .attr("x", x(newt[1].timestamp)-10)
                            .attr("y", y(newt[1].value + sd))
                            .attr("width", 20)
                            .attr("height", (2*sd/(y.domain()[1] - y.domain()[0]))*y.range()[0])
                            .style('fill', '#f2f2bc');
}

      function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
      }
      if(width > 400) {
        xzoomBeh.translate([-8600,0]).scale(10),
        xzoomBeh.event(rect.transition().duration(100)),
        zoom();
      }
      else {
        xzoomBeh.translate([-2900,0]).scale(11);
        xzoomBeh.event(rect.transition().duration(100));
        zoom();
      }
    return {svg: svg, color: color, width: width};
  }

  function loadGraph(lab_name, labValues, time = false, click = false) {
    if(click)
      d3.selectAll('#tableDiv1 .well a').remove();

      var labs = location.search.substring(1).split("&")[2], red = false, vred = false, trans = {
        "804-5":{"name": "WBC", "unit": "K/uL"},
        "718-7":{"name": "Hemoglobin", "unit": "g/dL"},
        "32693-4":{"name": "Lactate", "unit": "mmol/L"},
        "1975-2":{"name": "Bilirubin", "unit": "mg/dL"},
        "2160-0":{"name": "Creatinine", "unit": "mg/dL"},
        "777-3":{"name": "Platelet", "unit": "K/uL"}      
      };

        window.labValues = labValues, data = labValues[lab_name]["data"]
        data = data['d7'].concat(data['h12']).concat(data['h24']).concat(data['h72']);
        tmp = new Date();
        minTime = tmp.setHours(tmp.getHours() - 168);
        // change string (from CSV) into number format
        data.forEach(function(d) {
          d["value"] = +d["value"];
          if(d["type"] == "pred"){
            if(d["value"] <= labValues[lab_name]["critical"]["low"] || d["value"] >= labValues[lab_name]["critical"]["high"])
              red = true;
            if(d["value"] <= labValues[lab_name]["critical"]["vlow"] || d["value"] >= labValues[lab_name]["critical"]["vhigh"])
              vred = true;
          }
        });

        d3.select("h5").text(pat_name);
        var margin = {top: 20, right: 20, bottom: 30, left: 50}, width, height;
        if(labs){
          width = innerWidth * 0.9 - margin.left - margin.right,
          height = innerHeight * 0.9 - margin.top - margin.bottom;
        }
          else {
            width = innerWidth/3.2 - margin.left - margin.right,
          height = 260 - margin.top - margin.bottom;
          }
      
        var sd = labValues[lab_name]["sd"]
        return drawScatter(data, width, height, margin, trans[lab_name]["name"], lab_name, trans[lab_name]["unit"], sd, red, vred);



  }

  
};
