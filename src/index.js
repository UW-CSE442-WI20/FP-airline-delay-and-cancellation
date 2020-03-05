import {csv} from 'd3';

"use strict";
(function() {
  window.addEventListener('load', init);
  
  var mainData = [];
  var airportList = [];
  var flightList = [];
  var delayTimeList = [];
  var airlineUnique = [];

  function init() {
    const d3 = require('d3');
    const fuzzysort = require('fuzzysort');

    loadAirportData();
      
    // for search bars
    autocomplete(document.getElementById("originInput"), airportList);
    autocomplete(document.getElementById("destInput"), airportList);
  }
  
  // LOAD ORIGIN DATA
  function loadAirportData() {
    d3.csv('airportList.csv').then(function(data) {
      data.forEach(function(d) {
        airportList.push(d.City + ' (' + d.Airport + ')');
      })
    })
  }

  // GET ORIGIN AND DESTINATION INPUT
  // and then load the flight data by origin
  // once the origin has been chosen
  function loadFlightData() {
    var origin = document.getElementById('originInput').value;
    var dest = document.getElementById('destInput').value;

    origin = origin.substring(origin.length - 4, origin.length - 1);
    dest = dest.substring(dest.length - 4, dest.length - 1);
    // console.log("origin " + origin + ", destination " + dest);
    
    if (dest) {
      d3.csv(origin + '.csv')
      .then(function(data) {
        flightList = [];
        //console.log(data[0].Destination);
        //console.log("dest: " + dest);
        data.forEach(function(d) {
          if (d.Destination == dest) {
            //console.log('inside if');
            flightList.push(d);
          }
        })
        
        if (flightList.length == 0) {
          // print message
          alert("there is no available flight data for this itinerary");
          d3.selectAll("svg").remove();
        } else {
            // Delete old svg before drawing a new one
            d3.selectAll("#line-chart").remove();
            d3.selectAll("#pie-chart").remove();
            drawDelayedBars(2018, 2019);
        }

        flightList.forEach(function(d) {
          //console.log(d);
        })

      });
    }

  }
 
  // pass in year range in here
  // minYear (inclusive), maxYear(exclusive)
  // if slider is only 2015, then minYear: 2015, maxYear: 2016
  function drawDelayedBars(minYear, maxYear) {
    var flightYear = [];
    var airlines = [];
    // include all the flights after year filter has been set
    flightList.forEach(function(d) {
      if (d.Year >= minYear && d.Year < maxYear) {
        flightYear.push(d);
        airlines.push(d.Airline);
      }
    })

    // get all the airlines
    airlineUnique = [...new Set(airlines)];

    // SET UP SVG
    var margin = {top: 50, right: 35, bottom: 50, left: 50},
    w = 630 - (margin.left + margin.right),
    h = 500 - (margin.top + margin.bottom);

    var x = d3.scaleLinear()
      .domain([1, 12])
      .rangeRound([0, w]);

    var y = d3.scaleLinear()
      .domain([-60, 90])
      .range([h, 0]);

    var xAxis = d3.axisBottom(x)
      .ticks(10);
    
    var yAxis = d3.axisLeft(y)
      .ticks(10);

    var xGrid = d3.axisBottom(x)
      .ticks(5)
      .tickSize(-h, 0, 0)
      .tickFormat('');

    var yGrid = d3.axisLeft(y)
      .ticks(5)
      .tickSize(-w, 0, 0)
      .tickFormat('');

    var svg = d3.select('#chart').append('svg')
      .attr("id", "line-chart")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('g')
      .attr('class', 'x axes')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axes')
      .call(yAxis);

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xGrid);

    svg.append('g')
      .attr('class', 'y-grid')
      .call(yGrid);

    airlineUnique.forEach(function(d) {
      var mean = getMean(d, flightYear);
      plotLine(mean, d);
    })

    function plotLine(mean_data, cirClass) {
      var line = d3.line()
        .curve(d3.curveCardinal)
        .x(function (d) {
          return x(d.month);
        })
        .y(function (d) {
          return y(d.mean);
        });

      var tooltip = d3.select('#chart')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .text('');
  
      svg.append('path')
        .datum(mean_data)
        .attr('class', 'line')
        .attr('d', line);
  
      svg.selectAll('.dot')
        .data(mean_data)
        .enter().append('circle')
        .attr('class', cirClass)
        .attr('cy', function(d) {
          return y(d.mean);
        })
        .attr('cx', function(d, i) {
          return x(d.month);
        })
        .attr('r', 4)
        .style('fill', 'blue')
        .on('mouseover', function(d) {
          return tooltip.style('visibility', 'visible').text(d.airline);
        })
        .on('mousemove', function() {
          return tooltip.style('top', (event.pageY - 10)+'px').style('left', (event.pageX+10)+'px');
        })
        .on('mouseout', function() {
          return tooltip.style('visibility', 'hidden');
        })
        .on('click', function(d) {
          // Delete old svg before drawing a new one
          d3.selectAll("#pie-chart").remove();
          drawCancel(d.airline, mean_data);
        });

    }
  }

  function getMean(airline, flightYear) {
    var mean = [];
    for (var i = 0; i < 12; i++) {
      var count = 0;
      var total = 0;
      var j = 0;

      flightYear.forEach(function(d) {
        j++;
        if (+d.Month === +(i + 1) && !isNaN(+d['Departure Delay Time (mins)']) && d.Airline === airline) {
          count++;
          total += +d['Departure Delay Time (mins)'];
        }
      })

      var temp = {airline: airline, month: (i + 1), mean: (total / count)};
      if (!isNaN(temp.mean)) {
        mean.push(temp);
      }
    }
    return mean;
  }

  // Cancellation Pie Chart
  function drawCancel(airline, mean) {
    var total = 0, carrier = 0, weather = 0, nationalAir = 0, security = 0;
    var x = document.getElementById("no-cancel");
    if (flightList.length != 0) {
    flightList.forEach(function(d) {
        if (d.Airline == airline) {
            total++;
            if (d['Flight Cancellation'] == 1) {
               if (d['Cancellation Reason'] == 'Airline')
                 carrier++;
               if (d['Cancellation Reason'] == 'Weather')
                 weather++;
               if (d['Cancellation Reason'] == 'National Air System')
                 nationalAir++;
               if (d['Cancellation Reason'] == 'Security')
                 security++;
            }
        }
    });
   var totalCan = carrier + weather + nationalAir + security;
   // set the dimensions and margins of the graph
   var width = 450,
       height = 450,
       margin = 40;

   // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
   var radius = Math.min(width, height) / 2 - margin;

   // append the svg object to the div called 'cancellation'
   var svg = d3.select("#cancellation")
     .append("svg")
       .attr("id", "pie-chart")
       .attr("width", width)
       .attr("height", height)
     .append("g")
       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

   var data = {'Airline' : carrier, 'Weather': weather, 'National Air System': nationalAir, 'Security': security}

   // set the color scale
   var color = d3.scaleOrdinal()
     .domain(data)
     .range(d3.schemeTableau10);
   // Compute the position of each group on the pie:
   var pie = d3.pie()
     .value(function(d) { return d.value; })
   var data_ready = pie(d3.entries(data))
   // Now I know that group A goes from 0 degrees to x degrees and so on.

   // shape helper to build arcs:
   var arcGenerator = d3.arc()
     .innerRadius(radius - radius/3)
     .outerRadius(radius)

   // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
   if (totalCan != 0) {
   x.style.display = "none";
   svg
     .selectAll('mySlices')
     .data(data_ready)
     .enter()
     .append('path')
       .attr('d', arcGenerator)
       .attr('fill', function(d){ return(color(d.data.key)) })
       .attr("stroke", "black")
       .style("stroke-width", "2px")
       .style("opacity", 0.7)

   // Now add the annotation. Use the centroid method to get the best coordinates
   svg
     .selectAll('mySlices')
     .data(data_ready)
     .enter()
     .append('text')
     .text(function(d){ if(d.data.value != 0) return d.data.key})
     .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
     .style("text-anchor", "middle")
     .style("font-size", 17)
     } else {
        x.style.display = "block";
     }
     }
  }

  // AUTOCOMPLETE SEARCH FIELD ***********************************************
  function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);

        // ----- ORIGINAL CODE
        /*for each item in the array...*/
        // for (i = 0; i < arr.length; i++) {
        //   /*check if the item starts with the same letters as the text field value:*/
        //   if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        //     /*create a DIV element for each matching element:*/
        //     b = document.createElement("DIV");
        //     /*make the matching letters bold:*/
        //     b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        //     b.innerHTML += arr[i].substr(val.length);
        //     /*insert a input field that will hold the current array item's value:*/
        //     b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        //     /*execute a function when someone clicks on the item value (DIV element):*/
        //     b.addEventListener("click", function(e) {
        //         /*insert the value for the autocomplete text field:*/
        //         inp.value = this.getElementsByTagName("input")[0].value;
        //         loadFlightData();
        //         /*close the list of autocompleted values,
        //         (or any other open lists of autocompleted values:*/
        //         closeAllLists();
        //     });
        //     a.appendChild(b);
        //   }
        // }
        // ----- END ORIGINAL CODE

        // ----- FROM HERE, Alicia changed the method for searching to fuzzy
        // instead of only looking the first few characters
        // so people can search using the code too
        const results = fuzzysort.go(val, arr);
        console.log('begin');
        console.log(results);
        console.log('end');

        results.forEach(function(d) {
          b = document.createElement("DIV");
          b.innerHTML = d.target;
          b.innerHTML += "<input type='hidden' value='" + d.target + "'>";
          b.addEventListener('click', function(e) {
            inp.value = this.getElementsByTagName("input")[0].value;
            loadFlightData();
            closeAllLists();
          })
          a.appendChild(b);
        })

        // ----- TO HERE
    });
    
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }
  // END AUTOCOMPLETE SEARCH FIELD *******************************************

})();