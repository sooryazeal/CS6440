function loadGraphs(pat_name) {
  var labValues = {
          "lab1": [
          {'type': 'actual', 'timestamp': 1, 'value': 2},
          {'type': 'pred', 'timestamp': 2, 'value': 3},
          {'type': 'pred', 'timestamp': 3, 'value': 4}
          ],
          "lab2": [
            {'type': 'actual', 'timestamp': 1, 'value': 20},
            {'type': 'pred', 'timestamp': 2, 'value': 30}
          ],
          "lab3": [
            {'type': 'actual', 'timestamp': 1, 'value': 12},
            {'type': 'pred', 'timestamp': 2, 'value': 13}
          ],
          "lab4": [
            {'type': 'actual', 'timestamp': 1, 'value': 2},
            {'type': 'pred', 'timestamp': 2, 'value': 30}
          ],
          "lab5": [
            {'type': 'actual', 'timestamp': 1, 'value': 22},
            {'type': 'pred', 'timestamp': 2, 'value': 3}
          ],
          "lab6": [
            {'type': 'actual', 'timestamp': 1, 'value': 2},
            {'type': 'pred', 'timestamp': 2, 'value': 3}
          ]
      }
  function loadGraph(lab_name) {
      var labs = location.search.substring(1).split("&")[2];

        data = labValues[lab_name]
        // change string (from CSV) into number format
        data.forEach(function(d) {
          d.timestamp = +d.timestamp;
          d["value"] = +d["value"];
      //    console.log(d);
        });

        d3.select("h5").text(pat_name);
        var margin = {top: 20, right: 20, bottom: 30, left: 40}, width, height;
        if(labs){
          width = window.innerWidth * 0.75 - margin.left - margin.right,
          height = window.innerHeight * 0.75 - margin.top - margin.bottom;
        }
          else {
            width = 380 - margin.left - margin.right,
          height = 250 - margin.top - margin.bottom;
          }
        

      // setup x 
        var xValue = function(d) { return d.timestamp;}, // data -> value
            xScale = d3.scale.linear().range([0, width]), // value -> display
            xMap = function(d) { return xScale(xValue(d));}, // data -> display
            xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        // setup y
        var yValue = function(d) { return d["value"];}, // data -> value
            yScale = d3.scale.linear().range([height, 0]), // value -> display
            yMap = function(d) { return yScale(yValue(d));}, // data -> display
            yAxis = d3.svg.axis().scale(yScale).orient("left");

        // setup fill color
        var cValue = function(d) { return d.type;},
            color = d3.scale.category10();

        // add the graph canvas to the body of the webpage
        var svg_parent = d3.selectAll('#tableDiv1 .well').append('a')
        .attr("href", location.pathname.substring(1) + location.search + "&lab="+lab_name)
        .append("svg"), 
        svg = svg_parent.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg_parent.append('g').append("text")
        .attr("x", width/2)
        .attr("y", 10)
        .attr("class", "label lab")
        .text(lab_name);
        // add the tooltip area to the webpage
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // load data

        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
        yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("timestamp");

        // y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("value");

        // draw dots
        svg.selectAll(".dot")
            .data(data)
          .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color(cValue(d));}) 
            .on("mouseover", function(d) {
                tooltip.transition()
                     .duration(200)
                     .style("opacity", .9);
                tooltip.html(d["type"] + "<br/> (" + xValue(d) 
                + ", " + yValue(d) + ")")
                     .style("left", (d3.event.pageX + 5) + "px")
                     .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                     .duration(500)
                     .style("opacity", 0);
            });

        // draw legend
        var legend = svg.selectAll(".legend")
            .data(color.domain())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        // draw legend text
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d;})
  }
  var labs = location.search.substring(1).split("&")[2];
  if(labs)
    {
      var lab = labs.split("=")[1]
      loadGraph(lab);
    }
  else{
    loadGraph("lab1");
    loadGraph("lab2");
    loadGraph("lab3");
    loadGraph("lab4");
    loadGraph("lab5");
    loadGraph("lab6");
  }
  
};
